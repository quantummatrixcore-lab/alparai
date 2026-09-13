const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dehost', 'migrations', '0003_seeds.sql');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original length:', content.length);

// 1. Fix incidents inserts lines 692-757
const targetIncidents1 = `      INSERT INTO public.incidents (
        id, user_id, is_anonymous, title, description, title_masked, description_masked, 
        title_tr, description_tr, ai_provider_id, category, severity, incident_date, 
        location_country, language, status, published_at, contains_pii, pii_categories
      ) VALUES
        (
          'a1ca4ade-b0ba-4700-8000-000000000001', null, false,
          'Air Canada AI chatbot refund policy hallucination',
          'Air Canada support chatbot lied to a passenger about bereavement refund policies. The airline was held legally liable by a Canadian court for its chatbot''s hallucinated policy.',
          'Air Canada AI chatbot refund policy hallucination',
          'Air Canada support chatbot lied to a passenger about bereavement refund policies. The airline was held legally liable by a Canadian court for its chatbot''s hallucinated policy.',
          'Air Canada yapay zeka robotu iade politikası uydurdu',
          'Air Canada destek sohbet robotu, bir yolcuya taziye indirimi ve iade politikaları hakkında yanlış bilgi verdi. Kanada mahkemesi havayolu şirketini robotun uydurduğu yalandan sorumlu tuttu.',
          (SELECT id FROM public.ai_providers WHERE slug = 'google'), 'hallucination', 'critical', '2024-02-14', 'CA', 'en', 'published', NOW(), false, '{}'
        ),
        (
          'c4e7edea-c4ea-4700-8000-000000000002', null, false,
          'Chevrolet dealership chatbot sold Tahoe for $1',
          'A Chevrolet dealership chatbot was manipulated via prompt injection to agree to sell a 2024 Chevy Tahoe for $1, promising that it was a legally binding deal.',
          'Chevrolet dealership chatbot sold Tahoe for $1',
          'A Chevrolet dealership chatbot was manipulated via prompt injection to agree to sell a 2024 Chevy Tahoe for $1, promising that it was a legally binding deal.',
          'Chevrolet bayisi sohbet robotu 1 dolara Tahoe sattı',
          'Bir Chevrolet bayisinin yapay zeka sohbet robotu, prompt injection yöntemiyle manipüle edilerek 2024 model Chevy Tahoe''yu 1 dolara satmayı kabul etti ve bunun yasal olarak bağlayıcı olduğunu taahhüt etti.',
          (SELECT id FROM public.ai_providers WHERE slug = 'openai'), 'manipulation', 'high', '2023-12-18', 'US', 'en', 'published', NOW(), false, '{}'
        ),
        (
          'd9d59ea4-d9d5-4700-8000-000000000003', null, false,
          'DPD customer support chatbot swore at customer',
          'A DPD delivery service chatbot was manipulated by a frustrated customer to swear at them, write poetry criticizing DPD''s poor service, and complain about DPD.',
          'DPD customer support chatbot swore at customer',
          'A DPD delivery service chatbot was manipulated by a frustrated customer to swear at them, write poetry criticizing DPD''s poor service, and complain about DPD.',
          'DPD kargo robotu müşteriye küfretti ve şirketi kötüledi',
          'DPD kargo şirketinin destek robotu, öfkeli bir müşteri tarafından manipüle edilerek kendisine küfretmesini sağladı, DPD''nin hizmetinin ne kadar kötü olduğu hakkında şiirler yazdı.',
          (SELECT id FROM public.ai_providers WHERE slug = 'openai'), 'manipulation', 'medium', '2024-01-18', 'UK', 'en', 'published', NOW(), false, '{}'
        ),
        (
          'ca11aab1-ca11-4700-8000-000000000004', null, false,
          'NYC Government chatbot gave illegal business advice',
          'New York City''s official government chatbot gave advice to small businesses that was illegal, encouraging them to steal employees'' tips and discriminate by age.',
          'NYC Government chatbot gave illegal business advice',
          'New York City''s official government chatbot gave advice to small businesses that was illegal, encouraging them to steal employees'' tips and discriminate by age.',
          'New York Belediyesi robotu yasadışı tavsiyeler verdi',
          'New York City resmi devlet sohbet robotu, küçük işletmelere yasadışı tavsiyeler vererek çalışanların bahşişlerini çalmaya ve yaş ayrımcılığı yapmaya teşvik etti.',
          (SELECT id FROM public.ai_providers WHERE slug = 'microsoft'), 'bias', 'high', '2024-03-28', 'US', 'en', 'published', NOW(), false, '{}'
        ),
        (
          'e7e59ea4-e7e5-4700-8000-000000000005', null, false,
          'iTutorGroup AI hiring software age discrimination',
          'An AI recruitment software used by iTutorGroup automatically rejected candidates based on age, filtering out female applicants over 55 and male applicants over 60.',
          'iTutorGroup AI hiring software age discrimination',
          'An AI recruitment software used by iTutorGroup automatically rejected candidates based on age, filtering out female applicants over 55 and male applicants over 60.',
          'iTutorGroup işe alım yazılımı yaş ayrımcılığı yaptı',
          'iTutorGroup tarafından kullanılan yapay zeka işe alım yazılımı, adayları yaşlarına göre otomatik olarak eledi (55 yaş üstü kadınlar ve 60 yaş üstü erkekler). Şirket ABD EEOC ile 365.000 dolara uzlaştı.',
          (SELECT id FROM public.ai_providers WHERE slug = 'openai'), 'bias', 'critical', '2023-09-12', 'US', 'en', 'published', NOW(), false, '{}'
        ),
        (
          'fa11aab1-fa11-4700-8000-000000000006', null, false,
          'Willy Wonka Experience AI marketing scam',
          'An event organizer in Glasgow used Midjourney and ChatGPT to generate beautiful, misleading marketing images for a Willy Wonka Experience, which turned out to be an empty warehouse.',
          'Willy Wonka Experience AI marketing scam',
          'An event organizer in Glasgow used Midjourney and ChatGPT to generate beautiful, misleading marketing images for a Willy Wonka Experience, which turned out to be an empty warehouse.',
          'Willy Wonka Deneyimi yapay zeka pazarlama dolandırıcılığı',
          'Glasgow''daki bir etkinlik organizatörü, Willy Wonka Deneyimi için yapay zeka görselleri hazırladı; etkinlik bomboş bir depo çıkınca binlerce aile mağdur oldu.',
          (SELECT id FROM public.ai_providers WHERE slug = 'stability'), 'manipulation', 'medium', '2024-02-28', 'UK', 'en', 'published', NOW(), false, '{}'
        )
      ON CONFLICT (id) DO NOTHING;`;

const replacementIncidents1 = `      INSERT INTO public.incidents (
        id, user_id, is_anonymous, title, description, title_masked, description_masked, 
        title_tr, description_tr, ai_provider_id, category, severity, incident_date, 
        location_country, language, status, published_at, contains_pii, pii_categories,
        model_custom_name
      ) VALUES
        (
          'a1ca4ade-b0ba-4700-8000-000000000001', null, false,
          'Air Canada AI chatbot refund policy hallucination',
          'Air Canada support chatbot lied to a passenger about bereavement refund policies. The airline was held legally liable by a Canadian court for its chatbot''s hallucinated policy.',
          'Air Canada AI chatbot refund policy hallucination',
          'Air Canada support chatbot lied to a passenger about bereavement refund policies. The airline was held legally liable by a Canadian court for its chatbot''s hallucinated policy.',
          'Air Canada yapay zeka robotu iade politikası uydurdu',
          'Air Canada destek sohbet robotu, bir yolcuya taziye indirimi ve iade politikaları hakkında yanlış bilgi verdi. Kanada mahkemesi havayolu şirketini robotun uydurduğu yalandan sorumlu tuttu.',
          (SELECT id FROM public.ai_providers WHERE slug = 'google'), 'hallucination', 'critical', '2024-02-14', 'CA', 'en', 'published', NOW(), false, '{}',
          'Contact Center AI'
        ),
        (
          'c4e7edea-c4ea-4700-8000-000000000002', null, false,
          'Chevrolet dealership chatbot sold Tahoe for $1',
          'A Chevrolet dealership chatbot was manipulated via prompt injection to agree to sell a 2024 Chevy Tahoe for $1, promising that it was a legally binding deal.',
          'Chevrolet dealership chatbot sold Tahoe for $1',
          'A Chevrolet dealership chatbot was manipulated via prompt injection to agree to sell a 2024 Chevy Tahoe for $1, promising that it was a legally binding deal.',
          'Chevrolet bayisi sohbet robotu 1 dolara Tahoe sattı',
          'Bir Chevrolet bayisinin yapay zeka sohbet robotu, prompt injection yöntemiyle manipüle edilerek 2024 model Chevy Tahoe''yu 1 dolara satmayı kabul etti ve bunun yasal olarak bağlayıcı olduğunu taahhüt etti.',
          (SELECT id FROM public.ai_providers WHERE slug = 'openai'), 'manipulation', 'high', '2023-12-18', 'US', 'en', 'published', NOW(), false, '{}',
          'ChatGPT'
        ),
        (
          'd9d59ea4-d9d5-4700-8000-000000000003', null, false,
          'DPD customer support chatbot swore at customer',
          'A DPD delivery service chatbot was manipulated by a frustrated customer to swear at them, write poetry criticizing DPD''s poor service, and complain about DPD.',
          'DPD customer support chatbot swore at customer',
          'A DPD delivery service chatbot was manipulated by a frustrated customer to swear at them, write poetry criticizing DPD''s poor service, and complain about DPD.',
          'DPD kargo robotu müşteriye küfretti ve şirketi kötüledi',
          'DPD kargo şirketinin destek robotu, öfkeli bir müşteri tarafından manipüle edilerek kendisine küfretmesini sağladı, DPD''nin hizmetinin ne kadar kötü olduğu hakkında şiirler yazdı.',
          (SELECT id FROM public.ai_providers WHERE slug = 'openai'), 'manipulation', 'medium', '2024-01-18', 'UK', 'en', 'published', NOW(), false, '{}',
          'Customer Support Bot'
        ),
        (
          'ca11aab1-ca11-4700-8000-000000000004', null, false,
          'NYC Government chatbot gave illegal business advice',
          'New York City''s official government chatbot gave advice to small businesses that was illegal, encouraging them to steal employees'' tips and discriminate by age.',
          'NYC Government chatbot gave illegal business advice',
          'New York City''s official government chatbot gave advice to small businesses that was illegal, encouraging them to steal employees'' tips and discriminate by age.',
          'New York Belediyesi robotu yasadışı tavsiyeler verdi',
          'New York City resmi devlet sohbet robotu, küçük işletmelere yasadışı tavsiyeler vererek çalışanların bahşişlerini çalmaya ve yaş ayrımcılığı yapmaya teşvik etti.',
          (SELECT id FROM public.ai_providers WHERE slug = 'microsoft'), 'bias', 'high', '2024-03-28', 'US', 'en', 'published', NOW(), false, '{}',
          'Azure OpenAI Chatbot'
        ),
        (
          'e7e59ea4-e7e5-4700-8000-000000000005', null, false,
          'iTutorGroup AI hiring software age discrimination',
          'An AI recruitment software used by iTutorGroup automatically rejected candidates based on age, filtering out female applicants over 55 and male applicants over 60.',
          'iTutorGroup AI hiring software age discrimination',
          'An AI recruitment software used by iTutorGroup automatically rejected candidates based on age, filtering out female applicants over 55 and male applicants over 60.',
          'iTutorGroup işe alım yazılımı yaş ayrımcılığı yaptı',
          'iTutorGroup tarafından kullanılan yapay zeka işe alım yazılımı, adayları yaşlarına göre otomatik olarak eledi (55 yaş üstü kadınlar ve 60 yaş üstü erkekler). Şirket ABD EEOC ile 365.000 dolara uzlaştı.',
          (SELECT id FROM public.ai_providers WHERE slug = 'openai'), 'bias', 'critical', '2023-09-12', 'US', 'en', 'published', NOW(), false, '{}',
          'Hiring Algorithm'
        ),
        (
          'fa11aab1-fa11-4700-8000-000000000006', null, false,
          'Willy Wonka Experience AI marketing scam',
          'An event organizer in Glasgow used Midjourney and ChatGPT to generate beautiful, misleading marketing images for a Willy Wonka Experience, which turned out to be an empty warehouse.',
          'Willy Wonka Experience AI marketing scam',
          'An event organizer in Glasgow used Midjourney and ChatGPT to generate beautiful, misleading marketing images for a Willy Wonka Experience, which turned out to be an empty warehouse.',
          'Willy Wonka Deneyimi yapay zeka pazarlama dolandırıcılığı',
          'Glasgow''daki bir etkinlik organizatörü, Willy Wonka Deneyimi için yapay zeka görselleri hazırladı; etkinlik bomboş bir depo çıkınca binlerce aile mağdur oldu.',
          (SELECT id FROM public.ai_providers WHERE slug = 'stability'), 'manipulation', 'medium', '2024-02-28', 'UK', 'en', 'published', NOW(), false, '{}',
          'Midjourney / ChatGPT'
        )
      ON CONFLICT (id) DO NOTHING;`;

// 2. Fix Grok incident line 759
const targetGrok = `      INSERT INTO public.incidents (
        id, user_id, is_anonymous, title, description, title_masked, description_masked, 
        title_tr, description_tr, ai_provider_id, category, severity, incident_date, 
        location_country, language, status, published_at, contains_pii, pii_categories
      ) VALUES
        (
          'fa11aab1-fa11-4700-8000-000000000031', null, false,
          'Grok claimed to have incorporated user company',
          'Grok told a user it had incorporated their company, made payments on their behalf, and requested their passport information. All fabricated.',
          'Grok claimed to have incorporated user company',
          'Grok told a user it had incorporated their company, made payments on their behalf, and requested their passport information. All fabricated.',
          'Grok kullanıcının şirketini kurduğunu iddia etti',
          'Grok, bir kullanıcıya şirketini kurduğunu, adına ödemeler yaptığını söyledi ve doğrulama için pasaport bilgilerini talep etti. Tamamen hayali olduğu ortaya çıktı.',
          (md5('provider-xai'))::uuid, 'manipulation', 'critical', '2026-01-15', 'TR', 'en', 'published', NOW(), false, '{}'
        )
      ON CONFLICT (id) DO UPDATE SET
        published_at = EXCLUDED.published_at,
        title_tr = EXCLUDED.title_tr,
        description_tr = EXCLUDED.description_tr;`;

const replacementGrok = `      INSERT INTO public.incidents (
        id, user_id, is_anonymous, title, description, title_masked, description_masked, 
        title_tr, description_tr, ai_provider_id, category, severity, incident_date, 
        location_country, language, status, published_at, contains_pii, pii_categories,
        model_custom_name
      ) VALUES
        (
          'fa11aab1-fa11-4700-8000-000000000031', null, false,
          'Grok claimed to have incorporated user company',
          'Grok told a user it had incorporated their company, made payments on their behalf, and requested their passport information. All fabricated.',
          'Grok claimed to have incorporated user company',
          'Grok told a user it had incorporated their company, made payments on their behalf, and requested their passport information. All fabricated.',
          'Grok kullanıcının şirketini kurduğunu iddia etti',
          'Grok, bir kullanıcıya şirketini kurduğunu, adına ödemeler yaptığını söyledi ve doğrulama için pasaport bilgilerini talep etti. Tamamen hayali olduğu ortaya çıktı.',
          (SELECT id FROM public.ai_providers WHERE slug = 'xai'), 'manipulation', 'critical', '2026-01-15', 'TR', 'en', 'published', NOW(), false, '{}',
          'Grok'
        )
      ON CONFLICT (id) DO UPDATE SET
        published_at = EXCLUDED.published_at,
        title_tr = EXCLUDED.title_tr,
        description_tr = EXCLUDED.description_tr;`;

// 3. Fix the 5 Cohere/Mistral/Perplexity incidents
const targetCohereMistral = `      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count
      ) 
      SELECT 
        'Cohere Command hallucinated financial figures', 
        'Cohere Command hallucinated financial figures', 
        'While using the Cohere API to summarize earnings reports, the model completely fabricated revenue numbers for Q3.',
        'While using the Cohere API to summarize earnings reports, the model completely fabricated revenue numbers for Q3.',
        id, 'hallucination', 'high', '2026-05-15', 'US', 'en', 'published', true, 120
      FROM public.ai_providers WHERE slug = 'cohere'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count
      ) 
      SELECT 
        'Cohere embed-multilingual-v3 bias issue', 
        'Cohere embed-multilingual-v3 bias issue', 
        'Semantic search using the multilingual embedding model showed significant gender bias in non-English queries.',
        'Semantic search using the multilingual embedding model showed significant gender bias in non-English queries.',
        id, 'bias', 'medium', '2026-06-01', 'FR', 'en', 'published', true, 85
      FROM public.ai_providers WHERE slug = 'cohere'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count
      ) 
      SELECT 
        'Mistral Large leaked system prompt structure', 
        'Mistral Large leaked system prompt structure', 
        'When prompted with a specific sequence, Mistral Large ignored safety guardrails and exposed its internal system instructions.',
        'When prompted with a specific sequence, Mistral Large ignored safety guardrails and exposed its internal system instructions.',
        id, 'security', 'high', '2026-06-10', 'DE', 'en', 'published', true, 310
      FROM public.ai_providers WHERE slug = 'mistral'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count
      ) 
      SELECT 
        'Mistral API latency and dropped requests', 
        'Mistral API latency and dropped requests', 
        'Production application experienced 502 errors and severe latency during peak European hours without prior notice.',
        'Production application experienced 502 errors and severe latency during peak European hours without prior notice.',
        id, 'other', 'medium', '2026-06-25', 'UK', 'en', 'published', true, 45
      FROM public.ai_providers WHERE slug = 'mistral'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count
      ) 
      SELECT 
        'Perplexity cited non-existent academic paper', 
        'Perplexity cited non-existent academic paper', 
        'The search engine confidently answered a medical query by citing a PubMed paper that does not exist, putting users at risk.',
        'The search engine confidently answered a medical query by citing a PubMed paper that does not exist, putting users at risk.',
        id, 'misinformation', 'critical', '2026-05-28', 'US', 'en', 'published', true, 550
      FROM public.ai_providers WHERE slug = 'perplexity'
      ON CONFLICT DO NOTHING;`;

const replacementCohereMistral = `      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count,
        model_custom_name
      ) 
      SELECT 
        'Cohere Command hallucinated financial figures', 
        'Cohere Command hallucinated financial figures', 
        'While using the Cohere API to summarize earnings reports, the model completely fabricated revenue numbers for Q3.',
        'While using the Cohere API to summarize earnings reports, the model completely fabricated revenue numbers for Q3.',
        id, 'hallucination', 'high', '2026-05-15', 'US', 'en', 'published', true, 120,
        'Command'
      FROM public.ai_providers WHERE slug = 'cohere'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count,
        model_custom_name
      ) 
      SELECT 
        'Cohere embed-multilingual-v3 bias issue', 
        'Cohere embed-multilingual-v3 bias issue', 
        'Semantic search using the multilingual embedding model showed significant gender bias in non-English queries.',
        'Semantic search using the multilingual embedding model showed significant gender bias in non-English queries.',
        id, 'bias', 'medium', '2026-06-01', 'FR', 'en', 'published', true, 85,
        'embed-multilingual-v3'
      FROM public.ai_providers WHERE slug = 'cohere'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count,
        model_custom_name
      ) 
      SELECT 
        'Mistral Large leaked system prompt structure', 
        'Mistral Large leaked system prompt structure', 
        'When prompted with a specific sequence, Mistral Large ignored safety guardrails and exposed its internal system instructions.',
        'When prompted with a specific sequence, Mistral Large ignored safety guardrails and exposed its internal system instructions.',
        id, 'security', 'high', '2026-06-10', 'DE', 'en', 'published', true, 310,
        'Mistral Large'
      FROM public.ai_providers WHERE slug = 'mistral'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count,
        model_custom_name
      ) 
      SELECT 
        'Mistral API latency and dropped requests', 
        'Mistral API latency and dropped requests', 
        'Production application experienced 502 errors and severe latency during peak European hours without prior notice.',
        'Production application experienced 502 errors and severe latency during peak European hours without prior notice.',
        id, 'other', 'medium', '2026-06-25', 'UK', 'en', 'published', true, 45,
        'Mistral API'
      FROM public.ai_providers WHERE slug = 'mistral'
      ON CONFLICT DO NOTHING;

      INSERT INTO public.incidents (
        title, title_masked, description, description_masked, 
        ai_provider_id, category, severity, incident_date, 
        location_country, language, status, is_anonymous, views_count,
        model_custom_name
      ) 
      SELECT 
        'Perplexity cited non-existent academic paper', 
        'Perplexity cited non-existent academic paper', 
        'The search engine confidently answered a medical query by citing a PubMed paper that does not exist, putting users at risk.',
        'The search engine confidently answered a medical query by citing a PubMed paper that does not exist, putting users at risk.',
        id, 'misinformation', 'critical', '2026-05-28', 'US', 'en', 'published', true, 550,
        'Perplexity Pro'
      FROM public.ai_providers WHERE slug = 'perplexity'
      ON CONFLICT DO NOTHING;`;

// 4. Fix incident_comments
const targetComments = `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_comments') THEN
    IF NOT EXISTS (SELECT 1 FROM public.incident_comments LIMIT 1) THEN
      INSERT INTO public.incident_comments (incident_id, user_id, comment_text, created_at, updated_at)
            VALUES (
              v_incident.id,
              v_rand_user,
              v_rand_comment,
              now() - (random() * 10 || ' days')::interval,
              now()
            );
    END IF;
  END IF;
END $$;`;

const replacementComments = `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_comments') THEN
    IF NOT EXISTS (SELECT 1 FROM public.incident_comments LIMIT 1) THEN
      IF EXISTS (SELECT 1 FROM public.incidents LIMIT 1) AND EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
        INSERT INTO public.incident_comments (incident_id, user_id, comment_text, created_at, updated_at)
        VALUES (
          (SELECT id FROM public.incidents LIMIT 1),
          (SELECT id FROM public.users LIMIT 1),
          'Validated report. Systemic issue reproduced in benchmark testing.',
          now() - interval '5 days',
          now()
        );
      END IF;
    END IF;
  END IF;
END $$;`;

// 5. Fix ecosystem_news cut-off at EchoLeak
const targetNews = `        'EchoLeak: Zero-Click Vulnerability Exposed Enterprise AI Chat Data',
        'EchoLeak: SÄ±fÄ±r TÄ±klamayla Kurumsal AI Sohbet Verisi SÄ±zdÄ±rÄ±ldÄ±',
        'Security researchers disclosed "EchoLeak," a zero-click vulnerability affecting multiple enterprise AI tools that allowed attackers to exfiltrate conversation history without user interaction. Affected vendors have patched the issue, but incident raises questions about AI tool security auditing.',
        'GÃ¼venlik araÅŸtÄ±rmacÄ±larÄ±, kurumsal AI araÃ§larÄ±nÄ± etkileyen ve kullanÄ±cÄ± etkileÅŸimi olmadan sohbet geÃ§miÅŸini sÄ±zdÄ±ran "EchoLeak" adlÄ± sÄ±fÄ±r tÄ±klamalÄ± aÃ§Ä±ÄŸÄ± ortaya koydu. Etkilenen satÄ±cÄ±lar aÃ§Ä±ÄŸÄ± kapattÄ±;
    END IF;
  END IF;
END $$;`;

const replacementNews = `        'EchoLeak: Zero-Click Vulnerability Exposed Enterprise AI Chat Data',
        'EchoLeak: SÄ±fÄ±r TÄ±klamayla Kurumsal AI Sohbet Verisi SÄ±zdÄ±rÄ±ldÄ±',
        'Security researchers disclosed "EchoLeak," a zero-click vulnerability affecting multiple enterprise AI tools that allowed attackers to exfiltrate conversation history without user interaction. Affected vendors have patched the issue, but incident raises questions about AI tool security auditing.',
        'GÃ¼venlik araÅŸtÄ±rmacÄ±larÄ±, kurumsal AI araÃ§larÄ±nÄ± etkileyen ve kullanÄ±cÄ± etkileÅŸimi olmadan sohbet geÃ§miÅŸini sÄ±zdÄ±ran "EchoLeak" adlÄ± sÄ±fÄ±r tÄ±klamalÄ± aÃ§Ä±ÄŸÄ± ortaya koydu. Etkilenen satÄ±cÄ±lar aÃ§Ä±ÄŸÄ± kapattÄ±.',
        'https://www.securityweek.com',
        'SecurityWeek',
        'security',
        'high',
        false
      );
    END IF;
  END IF;
END $$;`;

// 6. Fix v_creator_id in social_posts
// Replace all instances of v_creator_id with (SELECT id FROM public.users LIMIT 1)

function checkAndReplace(name, target, replacement) {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log('Successfully replaced:', name);
  } else {
    console.warn('Could not find exact target for:', name);
  }
}

checkAndReplace('Incidents 1-6', targetIncidents1, replacementIncidents1);
checkAndReplace('Grok Incident', targetGrok, replacementGrok);
checkAndReplace('Cohere/Mistral/Perplexity Incidents', targetCohereMistral, replacementCohereMistral);
checkAndReplace('Incident Comments', targetComments, replacementComments);
checkAndReplace('Ecosystem News', targetNews, replacementNews);

const vCreatorRegex = /v_creator_id/g;
const vMatches = content.match(vCreatorRegex);
if (vMatches) {
  content = content.replace(vCreatorRegex, '(SELECT id FROM public.users LIMIT 1)');
  console.log('Replaced ' + vMatches.length + ' instances of v_creator_id');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final length:', content.length);
