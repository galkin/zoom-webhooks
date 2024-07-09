#!/usr/bin/env node

const fs = require('node:fs/promises');
const child_process = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const exec = promisify(child_process.exec);

// download the spec file
const downloadFrom = 'https://developers.zoom.us/api-specs/zoom-api/events/ZoomAPIEvents-Meeting-spec.json';
const specFolder = path.join(__dirname, '../specs');
const specFile = 'ZoomAPIEvents-Meeting-spec.json';
const downloadTo = path.join(specFolder, specFile);
const modifiedSpecFile = 'ZoomAPIEvents-Meeting-spec-prepared.json';
const saveTo = path.join(specFolder, modifiedSpecFile);


async function downloadSpec() {
  await fs.rm(specFolder, { recursive: true });
  await fs.mkdir(specFolder, { recursive: true });
  const downloadTo = path.join(specFolder, specFile);
  await exec(`curl ${downloadFrom} -o ${downloadTo}`);
}

async function modifySpec() {
  const content = await fs.readFile(downloadTo, 'utf8');
  const spec = JSON.parse(content);
  for (const name of Object.keys(spec.webhooks)) {
    const webhook = spec.webhooks[name];
    webhook.post.requestBody.content['application/json'].schema.properties.event.enum = [name];
    webhook.post.requestBody.content['application/json'].schema.required = webhook.post.requestBody.content['application/json'].schema.required ?? ['event', 'event_ts', 'payload'];

    if (webhook.post.requestBody.content['application/json'].schema.properties.payload.properties.old_object) {
      delete webhook.post.requestBody.content['application/json'].schema.properties.payload.properties.old_object;
    }
  }
  spec.webhooks['endpoint.url_validation'] = getUrlValidationSpec();

  await fs.writeFile(saveTo, JSON.stringify(spec, null, 2));
}

function getUrlValidationSpec() {
  return  {
    post: {
      operationId: 'endpoint.url_validation',
      requestBody: {
        description: "# endpoint.url_validation",
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['event', 'event_ts', 'payload'],
              properties: {
                event: {
                  type: 'string',
                  description: 'The name of the event.',
                  enum: ['endpoint.url_validation'],
                },
                event_ts: {
                  type: 'integer',
                  format: 'int64',
                  description: 'A timestamp at which the event occurred.',
                },
                payload: {
                  type: 'object',
                  required: ['plainToken'],
                  properties: {
                    plainToken: {
                      type: 'string',
                      description: 'The string to hash.',
                    },
                  },
                  additionalProperties: false,
                },
              },
              additionalProperties: false,
            },
            examples: {
              'json-example': {
                summary: 'JSON example',
                value: {
                  payload: {
                    plainToken: 'qgg8vlvZRS6UYooatFL8Aw',
                  },
                  event_ts: 1654503849680,
                  event: 'endpoint.url_validation',
                },
              },
            },
          },
        },
      },
    },
  };
}

void modifySpec();
