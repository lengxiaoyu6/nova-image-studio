import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const serverSource = fs.readFileSync(
  path.resolve(testDir, '../../../../backend/server.js'),
  'utf8',
);

describe('backend GPT Image advanced params forwarding', () => {
  it('does not contain legacy GPT Image SKU gating or token suffix logic', () => {
    expect(serverSource).not.toContain('gpt-image-2-fast');
    expect(serverSource).not.toContain('gpt-image-2-plus');
    expect(serverSource).not.toContain('gpt-image-2-pro');
    expect(serverSource).not.toContain('TOKEN_SUFFIX');
    expect(serverSource).not.toContain('supportsGptImageAdvancedParams(');
  });

  it('uses the upstream-compatible multipart fields for image edits', () => {
    expect(serverSource).toContain("formData.append('response_format', 'b64_json')");
    expect(serverSource).toContain("formData.append('image[]', blob");
    expect(serverSource).not.toContain("formData.append('stream', 'true')");
    expect(serverSource).not.toContain("formData.append('partial_images', String(partialImages))");
    expect(serverSource).toContain("!IMAGE_STREAM_ENABLED || request.mode === 'image-to-image'");
  });

  it('forwards quality/background/output_format and conditional style in JSON generations', () => {
    expect(serverSource).toContain('n: 1');
    expect(serverSource).toContain('quality: advancedParams.quality');
    expect(serverSource).toContain('background: advancedParams.background');
    expect(serverSource).toContain("output_format: 'png'");
    expect(serverSource).toContain("advancedParams.style === 'vivid' || advancedParams.style === 'natural' ? { style: advancedParams.style } : {}");
  });

  it('retries an image edit as JSON only when multipart n validation fails', () => {
    expect(serverSource).toContain('function createGptImageJsonEditFallbackInit');
    expect(serverSource).toContain("'Content-Type': 'application/json'");
    expect(serverSource).toContain('function requestGptImageWithEditFallback');
    expect(serverSource).toContain('jsonImageEditFallback: true');
  });
  it('routes OpenAI image endpoint by mode rather than legacy model names', () => {
    expect(serverSource).toContain("request.mode === 'image-to-image'");
    expect(serverSource).toContain("/v1/images/edits");
    expect(serverSource).toContain("/v1/images/generations");
  });

  it('resolves and forwards size for OpenAI image requests', () => {
    expect(serverSource).toContain('function resolveGptImageRequestSize(request)');
    expect(serverSource).toContain('const customSize = normalizeCustomImageSize(request.customSize, 4096)');
    expect(serverSource).toContain('return getSupportedGptImageSize(request.model, request.outputSize, request.aspectRatio)');
    expect(serverSource).toContain('const resolvedSize = resolveGptImageRequestSize(request)');
    expect(serverSource).toContain('return requestGptImageWithEditFallback(apiKey, request, resolvedSize, { baseUrl });');
  });
});