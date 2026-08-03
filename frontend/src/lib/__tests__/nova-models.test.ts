import { beforeEach, describe, expect, it } from 'vitest';
import {
  FIXED_API_BASE_URL,
  getCompleteImageModels,
  getCompleteTextModels,
  loadRegistry,
} from '@/lib/nova-models';

describe('default model registry', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides editable GPT image and text model presets without API keys', () => {
    const registry = loadRegistry();

    expect(registry.imageModels).toEqual([
      expect.objectContaining({
        id: 'default-gpt-image-2',
        protocol: 'openai',
        name: 'gpt-image-2',
        modelId: 'gpt-image-2',
        apiKey: '',
        baseUrl: FIXED_API_BASE_URL,
        builtinPreset: 'gpt-image-2',
      }),
    ]);
    expect(registry.textModels).toEqual([
      expect.objectContaining({
        id: 'default-gpt-5-6-terra',
        protocol: 'openai-responses',
        name: 'gpt-5.6-terra',
        modelId: 'gpt-5.6-terra',
        apiKey: '',
        baseUrl: FIXED_API_BASE_URL,
      }),
    ]);
    expect(getCompleteImageModels(registry)).toEqual([]);
    expect(getCompleteTextModels(registry)).toEqual([]);
  });
});
