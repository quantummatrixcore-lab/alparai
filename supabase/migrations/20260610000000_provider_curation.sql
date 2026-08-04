-- Migration: Provider Curation (2026-06-10)
-- Removes 4 non-AI-provider companies, standardizes display names

-- Remove non-provider companies (only if no incident references them)
delete from public.ai_providers
where slug in ('databricks', 'huggingface', 'nvidia', 'scale')
  and not exists (
    select 1 from public.incidents i where i.ai_provider_id = public.ai_providers.id
  );

-- Standardize display names: "Company (Model)" format
update public.ai_providers set name = 'xAI (Grok)' where slug = 'xai' and name = 'xAI';
update public.ai_providers set name = 'OpenAI (ChatGPT)' where slug = 'openai' and name = 'OpenAI';
update public.ai_providers set name = 'Anthropic (Claude)' where slug = 'anthropic';
update public.ai_providers set name = 'Google (Gemini)' where slug = 'google';
update public.ai_providers set name = 'Meta (Llama)' where slug = 'meta' and name = 'Meta AI';
update public.ai_providers set name = 'Mistral AI' where slug = 'mistral' and name = 'Mistral AI';
update public.ai_providers set name = 'Alibaba (Qwen)' where slug = 'alibaba' and name = 'Alibaba';
update public.ai_providers set name = 'Baidu (Ernie)' where slug = 'baidu' and name = 'Baidu';
update public.ai_providers set name = 'Tencent (Hunyuan)' where slug = 'tencent' and name = 'Tencent';
update public.ai_providers set name = 'Pi (Inflection)' where slug = 'inflection' and name = 'Inflection AI';

-- Mark Chinese AI providers as verified
update public.ai_providers set is_verified = true
where slug in ('baidu', 'tencent', 'alibaba', 'qwen');

-- Update descriptions for clarity
update public.ai_providers
set description = 'AI company founded by Elon Musk. Creator of Grok AI assistant.'
where slug = 'xai' and description like '%Elon%';

update public.ai_providers
set description = 'Creator of GPT, DALL-E, Sora, ChatGPT.'
where slug = 'openai';

update public.ai_providers
set description = 'Creator of Claude AI assistant. Focus on AI safety research.'
where slug = 'anthropic';

update public.ai_providers
set description = 'Creator of Gemini, Bard, PaLM. Google DeepMind.'
where slug = 'google';

update public.ai_providers
set description = 'Creator of Llama open-weight models.'
where slug = 'meta';

update public.ai_providers
set description = 'Open-weight frontier models from France.'
where slug = 'mistral';

update public.ai_providers
set description = 'Open-source large language models with strong multilingual support.'
where slug = 'qwen';

update public.ai_providers
set description = 'Wenxin (Ernie) large language models and cloud AI services.'
where slug = 'baidu';

update public.ai_providers
set description = 'Hunyuan foundation models and AI cloud services.'
where slug = 'tencent';

update public.ai_providers
set description = 'Qwen family of large language models.'
where slug = 'alibaba';

-- Add logo URLs pointing to the new wordmark SVGs (created separately)
update public.ai_providers set logo_url = '/logos/providers/ai21.svg' where slug = 'ai21' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/elevenlabs.svg' where slug = 'elevenlabs' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/groq.svg' where slug = 'groq' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/inflection.svg' where slug = 'inflection' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/midjourney.svg' where slug = 'midjourney' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/runway.svg' where slug = 'runway' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/stability.svg' where slug = 'stability' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/baidu.svg' where slug = 'baidu' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/tencent.svg' where slug = 'tencent' and logo_url is null;
update public.ai_providers set logo_url = '/logos/providers/alibaba.svg' where slug = 'alibaba' and logo_url is null;
