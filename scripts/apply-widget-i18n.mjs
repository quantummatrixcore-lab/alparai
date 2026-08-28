import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGES_DIR = path.join(__dirname, "../messages");

const translations = {
  en: {
    visitor_analytics: {
      title: "CEO Analytics: Live Visitors",
      active_visitors: "Active Site Visitors",
      seo_traffic: "SEO Organic Traffic",
    },
    ai_ecosystem_radar: {
      title: "AI Ecosystem Radar",
      current_leader: "Current Leading Model",
      iq_score: "IQ: {score}",
      token_trend: "Overall Token Price Trend",
      openai_api: "OpenAI API",
      anthropic_api: "Anthropic API",
    },
    financial_operations: {
      title: "FINANCIAL OPERATIONS",
      positive_runway: "POSITIVE RUNWAY",
      subtitle: "Real-Time MRR, Token Budget & Financial Arbitrage",
      rebalance_budget: "Rebalance Budget",
      rebalancing: "Rebalancing...",
      metrics: {
        net_mrr_title: "Net MRR (Monthly Revenue)",
        net_mrr_target: "Target: $50,000",
        ai_compute_title: "AI Compute Cost",
        ai_compute_sub: "0.5% of Total Budget",
        runway_title: "Runway Duration",
        runway_value: "42+ Mo",
        runway_sub: "Zero External Dependency",
        runway_change: "+6 Mo",
        gross_margin_title: "Gross Profit Margin",
        gross_margin_sub: "Driven by Autonomous Ops",
      },
      token_cost: {
        title: "AI Model & Token Cost Breakdown",
        savings: "Savings: 82.6%",
        load_label: "load",
        smart_routing: "Smart Token Routing (OpenCode Free Routing) Active",
        spending_limit: "Spending Limit: 100% Safe",
      },
      subscription_tiers: {
        title: "Subscription & Revenue Tiers",
        active_customers: "Active Customers",
        stripe_sync: "Stripe Webhook Synchronized • 0 Latency",
      },
    },
  },
  tr: {
    visitor_analytics: {
      title: "CEO Analitik: Canlı Ziyaretçi",
      active_visitors: "Sitedeki Aktif Kişi",
      seo_traffic: "SEO Organik Trafik",
    },
    ai_ecosystem_radar: {
      title: "Yapay Zeka Ekosistem Radarı",
      current_leader: "Şu Anki Lider Model",
      iq_score: "IQ: {score}",
      token_trend: "Genel Token Fiyat Trendi",
      openai_api: "OpenAI API",
      anthropic_api: "Anthropic API",
    },
    financial_operations: {
      title: "FİNANSAL OPERASYONLAR",
      positive_runway: "POZİTİF RUNWAY",
      subtitle: "Gerçek Zamanlı MRR, Token Bütçesi & Finansal Arbitraj",
      rebalance_budget: "Bütçe Rebalance",
      rebalancing: "Dengeleniyor...",
      metrics: {
        net_mrr_title: "Net MRR (Aylık Gelir)",
        net_mrr_target: "Hedef: $50,000",
        ai_compute_title: "AI Compute Gideri",
        ai_compute_sub: "Toplam Bütçenin %0.5'i",
        runway_title: "Runway Dayanımı",
        runway_value: "42+ Ay",
        runway_sub: "Sıfır Dış Bağımlılık",
        runway_change: "+6 Ay",
        gross_margin_title: "Brüt Kar Marjı",
        gross_margin_sub: "Otonom Operasyon Sayesinde",
      },
      token_cost: {
        title: "AI Model & Token Maliyet Dağılımı",
        savings: "Tasarruf: %82.6",
        load_label: "yük",
        smart_routing: "Akıllı Token Yönlendirme (OpenCode Free Routing) Aktif",
        spending_limit: "Harcama Limiti: %100 Güvenli",
      },
      subscription_tiers: {
        title: "Abonelik & Gelir Katmanları",
        active_customers: "Aktif Müşteri",
        stripe_sync: "Stripe Webhook Eşzamanlı • 0 Gecikme",
      },
    },
  },
  de: {
    visitor_analytics: {
      title: "CEO-Analytik: Live-Besucher",
      active_visitors: "Aktive Besucher auf der Website",
      seo_traffic: "Organischer SEO-Traffic",
    },
    ai_ecosystem_radar: {
      title: "KI-Ökosystem-Radar",
      current_leader: "Aktuelles Spitzenmodell",
      iq_score: "IQ: {score}",
      token_trend: "Allgemeiner Token-Preistrend",
      openai_api: "OpenAI API",
      anthropic_api: "Anthropic API",
    },
    financial_operations: {
      title: "FINANZOPERATIONEN",
      positive_runway: "POSITIVER RUNWAY",
      subtitle: "Echtzeit-MRR, Token-Budget & Finanz-Arbitrage",
      rebalance_budget: "Budget neu gewichten",
      rebalancing: "Wird neu gewichtet...",
      metrics: {
        net_mrr_title: "Netto-MRR (Monatlicher Umsatz)",
        net_mrr_target: "Ziel: $50.000",
        ai_compute_title: "KI-Compute-Kosten",
        ai_compute_sub: "0,5 % des Gesamtbudgets",
        runway_title: "Runway-Dauer",
        runway_value: "42+ Mon.",
        runway_sub: "Null externe Abhängigkeit",
        runway_change: "+6 Mon.",
        gross_margin_title: "Bruttomarge",
        gross_margin_sub: "Dank autonomem Betrieb",
      },
      token_cost: {
        title: "KI-Modell- & Token-Kostenaufteilung",
        savings: "Ersparnis: 82,6 %",
        load_label: "Last",
        smart_routing: "Intelligentes Token-Routing (OpenCode Free Routing) Aktiv",
        spending_limit: "Ausgabenlimit: 100 % Sicher",
      },
      subscription_tiers: {
        title: "Abonnement- & Umsatzstufen",
        active_customers: "Aktive Kunden",
        stripe_sync: "Stripe-Webhook synchronisiert • 0 Latenz",
      },
    },
  },
  es: {
    visitor_analytics: {
      title: "Analítica del CEO: Visitantes en Vivo",
      active_visitors: "Visitantes Activos en el Sitio",
      seo_traffic: "Tráfico Orgánico SEO",
    },
    ai_ecosystem_radar: {
      title: "Radar del Ecosistema de IA",
      current_leader: "Modelo Líder Actual",
      iq_score: "IQ: {score}",
      token_trend: "Tendencia General de Precios de Tokens",
      openai_api: "API de OpenAI",
      anthropic_api: "API de Anthropic",
    },
    financial_operations: {
      title: "OPERACIONES FINANCIERAS",
      positive_runway: "RUNWAY POSITIVO",
      subtitle: "MRR en Tiempo Real, Presupuesto de Tokens y Arbitraje Financiero",
      rebalance_budget: "Reequilibrar Presupuesto",
      rebalancing: "Reequilibrando...",
      metrics: {
        net_mrr_title: "MRR Neto (Ingresos Mensuales)",
        net_mrr_target: "Objetivo: $50,000",
        ai_compute_title: "Gasto de Cómputo de IA",
        ai_compute_sub: "0.5% del Presupuesto Total",
        runway_title: "Duración del Runway",
        runway_value: "42+ Meses",
        runway_sub: "Cero Dependencia Externa",
        runway_change: "+6 Meses",
        gross_margin_title: "Margen de Beneficio Bruto",
        gross_margin_sub: "Gracias a Operaciones Autónomas",
      },
      token_cost: {
        title: "Desglose de Costos de Modelos de IA y Tokens",
        savings: "Ahorro: 82.6%",
        load_label: "carga",
        smart_routing: "Enrutamiento Inteligente de Tokens (OpenCode Free Routing) Activo",
        spending_limit: "Límite de Gasto: 100% Seguro",
      },
      subscription_tiers: {
        title: "Niveles de Suscripción e Ingresos",
        active_customers: "Clientes Activos",
        stripe_sync: "Webhook de Stripe Sincronizado • 0 Latencia",
      },
    },
  },
  fr: {
    visitor_analytics: {
      title: "Analytique PDG : Visiteurs en Direct",
      active_visitors: "Visiteurs Actifs sur le Site",
      seo_traffic: "Trafic Organique SEO",
    },
    ai_ecosystem_radar: {
      title: "Radar de l'Écosystème IA",
      current_leader: "Modèle Leader Actuel",
      iq_score: "IQ : {score}",
      token_trend: "Tendance Générale des Prix des Tokens",
      openai_api: "API OpenAI",
      anthropic_api: "API Anthropic",
    },
    financial_operations: {
      title: "OPÉRATIONS FINANCIÈRES",
      positive_runway: "RUNWAY POSITIF",
      subtitle: "MRR en Temps Réel, Budget Tokens & Arbitrage Financier",
      rebalance_budget: "Rééquilibrer le Budget",
      rebalancing: "Rééquilibrage...",
      metrics: {
        net_mrr_title: "MRR Net (Revenu Mensuel)",
        net_mrr_target: "Objectif : 50 000 $",
        ai_compute_title: "Coût de Calcul IA",
        ai_compute_sub: "0,5 % du Budget Total",
        runway_title: "Durée du Runway",
        runway_value: "42+ Mois",
        runway_sub: "Zéro Dépendance Externe",
        runway_change: "+6 Mois",
        gross_margin_title: "Marge Bénéficiaire Brute",
        gross_margin_sub: "Grâce aux Opérations Autonomes",
      },
      token_cost: {
        title: "Répartition des Coûts des Modèles IA & Tokens",
        savings: "Économies : 82,6 %",
        load_label: "charge",
        smart_routing: "Routage Intelligent des Tokens (OpenCode Free Routing) Actif",
        spending_limit: "Limite de Dépenses : 100 % Sécurisée",
      },
      subscription_tiers: {
        title: "Niveaux d'Abonnement & Revenus",
        active_customers: "Clients Actifs",
        stripe_sync: "Webhook Stripe Synchronisé • 0 Latence",
      },
    },
  },
  ru: {
    visitor_analytics: {
      title: "Аналитика CEO: Посетители Онлайн",
      active_visitors: "Активные Пользователи на Сайте",
      seo_traffic: "Органический SEO-Трафик",
    },
    ai_ecosystem_radar: {
      title: "Радар Экосистемы ИИ",
      current_leader: "Текущая Модель-Лидер",
      iq_score: "IQ: {score}",
      token_trend: "Общий Тренд Цен на Токены",
      openai_api: "OpenAI API",
      anthropic_api: "Anthropic API",
    },
    financial_operations: {
      title: "ФИНАНСОВЫЕ ОПЕРАЦИИ",
      positive_runway: "ПОЛОЖИТЕЛЬНЫЙ RUNWAY",
      subtitle: "MRR в Реальном Времени, Бюджет Токенов и Финансовый Арбитраж",
      rebalance_budget: "Ребалансировать Бюджет",
      rebalancing: "Ребалансировка...",
      metrics: {
        net_mrr_title: "Чистый MRR (Ежемесячный Доход)",
        net_mrr_target: "Цель: $50 000",
        ai_compute_title: "Расходы на Вычисления ИИ",
        ai_compute_sub: "0.5% от Общего Бюджета",
        runway_title: "Запас Прочности (Runway)",
        runway_value: "42+ Мес.",
        runway_sub: "Ноль Внешней Зависимости",
        runway_change: "+6 Мес.",
        gross_margin_title: "Валовая Маржа",
        gross_margin_sub: "За Счет Автономных Операций",
      },
      token_cost: {
        title: "Распределение Затрат на Модели ИИ и Токены",
        savings: "Экономия: 82.6%",
        load_label: "нагрузка",
        smart_routing: "Умная Маршрутизация Токенов (OpenCode Free Routing) Активна",
        spending_limit: "Лимит Расходов: 100% Безопасно",
      },
      subscription_tiers: {
        title: "Уровни Подписки и Доходов",
        active_customers: "Активные Клиенты",
        stripe_sync: "Синхронизация Stripe Webhook • 0 Задержка",
      },
    },
  },
};

const enRaw = fs.readFileSync(path.join(MESSAGES_DIR, "en.json"), "utf8").replace(/^\uFEFF/, "");
const enBase = JSON.parse(enRaw);

for (const [lang, dict] of Object.entries(translations)) {
  const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
  let content;
  if (fs.existsSync(filePath)) {
    content = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } else {
    // Create new locale file cloned from base
    content = JSON.parse(JSON.stringify(enBase));
  }

  if (!content.admin) {
    content.admin = {};
  }

  content.admin.visitor_analytics = dict.visitor_analytics;
  content.admin.ai_ecosystem_radar = dict.ai_ecosystem_radar;
  content.admin.financial_operations = dict.financial_operations;

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf8");
  console.log(`Updated ${lang}.json successfully.`);
}

console.log("All translation files successfully synced!");
