import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  ShieldCheck,
  Cloud,
  GitBranch,
  LineChart,
  Lock,
  Search,
  Server,
  Sparkles,
  Timer,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Boxes,
  Globe,
} from 'lucide-react';

/**
 * XVAL - mock funcional navegável (dark)
 * Paleta: Base #0A0A0F | Lime #B6FF4A | Blue #2B6CFF | Magenta #FF4FD8 | Mist #F5F7FF
 */

type Lang = 'pt' | 'en';

type Area =
  | 'Consultoria Estratégica'
  | 'Segurança da Informação'
  | 'Infraestrutura'
  | 'DevOps'
  | 'Banco de Dados';

type Service = {
  area: Area;
  title: Record<Lang, string>;
  tags: string[];
  icon: React.ReactNode;
  description: Record<Lang, string>;
};

type BrandPalette = {
  base: string;
  surface: string;
  lime: string;
  blue: string;
  magenta: string;
  mist: string;
};

const BRAND_DARK: BrandPalette = {
  base: '#0A0A0F',
  surface: '#0F1118',
  // Green (original)
  lime: '#B6FF4A',
  blue: '#2B6CFF',
  magenta: '#FF4FD8',
  mist: '#F5F7FF',
};

// Assets
const LOGO_ICON_SRC = '/xval_logo.png';
const LOGOMARCA_SRC = '/xval_logomarca_val_branco_transparente_trim.svg';

function rgba(hex: string, a: number) {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function TypewriterText({
  text,
  speedMs = 28,
  startDelayMs = 200,
  showCursor = true,
}: {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
  showCursor?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIdx(0);
    setReady(false);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIdx(text.length);
      setReady(true);
      return;
    }

    const t0 = window.setTimeout(() => setReady(true), startDelayMs);
    return () => window.clearTimeout(t0);
  }, [text, startDelayMs]);

  useEffect(() => {
    if (!ready) return;
    if (idx >= text.length) return;

    const t = window.setTimeout(() => setIdx((v) => v + 1), speedMs);
    return () => window.clearTimeout(t);
  }, [idx, ready, speedMs, text.length]);

  const done = idx >= text.length;

  return (
    <>
      {text.slice(0, idx)}
      {showCursor && !done ? (
        <motion.span
          aria-hidden
          className="inline-block align-baseline"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        >
          |
        </motion.span>
      ) : null}
    </>
  );
}

// Reveal (scroll -> aparece aos poucos)
const REVEAL_INITIAL = { opacity: 0, y: 14 };
const REVEAL_ANIMATE = { opacity: 1, y: 0 };
const REVEAL_VIEWPORT = { once: true, amount: 0.2 };
const REVEAL_TRANSITION = {
  duration: 0.55,
  ease: [0.21, 0.61, 0.35, 1] as const,
};

function useSmoothScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (!target) return;
      const maybeLink = target.closest('a[data-scroll]');
      if (!(maybeLink instanceof HTMLAnchorElement)) return;
      const href = maybeLink.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

function usePersistedLang() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'pt';
    const raw = window.localStorage.getItem('xval_lang');
    return raw === 'en' || raw === 'pt' ? raw : 'pt';
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('xval_lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  return { lang, setLang };
}

function XvalLogo({
  size = 44,
  variant = 'badge',
  wordmark = true,
  font = 'sans',
  logoSrc,
  brand = BRAND_DARK,
}: {
  size?: number;
  variant?: 'badge' | 'plain';
  wordmark?: boolean;
  font?: 'sans' | 'mono' | 'wide';
  logoSrc?: string;
  brand?: BrandPalette;
}) {
  const [imgOk, setImgOk] = useState(true);
  const s = size;
  const pad = Math.round(s * 0.18);
  const mark = Math.round(s * 0.95);

  const family =
    font === 'mono'
      ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
      : 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';

  const wordSpacing = font === 'wide' ? 0.6 : 0;

  if (logoSrc && imgOk) {
    return (
      <div className="inline-flex items-center gap-3">
        <div
          className="relative shrink-0"
          style={{ width: mark, height: mark }}
          aria-label="XVAL"
          role="img"
        >
          {variant === 'badge' ? (
            <div
              className="h-full w-full overflow-hidden rounded-[22px] border border-white/10 bg-[#0F1118]"
              style={{ boxShadow: '0 8px 28px rgba(0,0,0,0.45)' }}
            >
              <img
                src={logoSrc}
                alt="XVAL"
                className="h-full w-full object-contain"
                onError={() => setImgOk(false)}
              />
            </div>
          ) : (
            <img
              src={logoSrc}
              alt="XVAL"
              className="h-full w-full object-contain"
              onError={() => setImgOk(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      <svg
        width={mark}
        height={mark}
        viewBox={`0 0 ${mark} ${mark}`}
        role="img"
        aria-label="XVAL"
        className="shrink-0"
      >
        {variant === 'badge' && (
          <rect
            x={0}
            y={0}
            width={mark}
            height={mark}
            rx={Math.round(mark * 0.26)}
            fill={brand.surface}
            stroke="rgba(255,255,255,0.10)"
          />
        )}

        <defs>
          <linearGradient id="xval_g_lime" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={brand.lime} stopOpacity="1" />
            <stop offset="1" stopColor={brand.lime} stopOpacity="0.78" />
          </linearGradient>
          <linearGradient id="xval_g_blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={brand.blue} stopOpacity="1" />
            <stop offset="1" stopColor={brand.blue} stopOpacity="0.78" />
          </linearGradient>
          <filter id="xval_shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.55"
            />
          </filter>
        </defs>

        <g transform={`translate(${pad},${pad})`} filter="url(#xval_shadow)">
          <path
            d={`M ${0} ${mark * 0.23} L ${mark * 0.24} ${mark * 0.45} L ${mark * 0.12} ${mark * 0.58} L ${-mark * 0.12} ${mark * 0.36} Z`}
            fill="url(#xval_g_lime)"
            opacity={0.95}
          />
          <path
            d={`M ${mark * 0.3} ${-mark * 0.05} L ${mark * 0.52} ${mark * 0.12} L ${mark * 0.4} ${mark * 0.26} L ${mark * 0.18} ${mark * 0.09} Z`}
            fill="url(#xval_g_blue)"
            opacity={0.95}
          />
          <path
            d={`M ${mark * 0.02} ${mark * 0.74} L ${mark * 0.24} ${mark * 0.57} L ${mark * 0.4} ${mark * 0.74} L ${mark * 0.18} ${mark * 0.91} Z`}
            fill="url(#xval_g_blue)"
            opacity={0.95}
          />
          <path
            d={`M ${mark * 0.42} ${mark * 0.48} L ${mark * 0.66} ${mark * 0.3} L ${mark * 0.78} ${mark * 0.44} L ${mark * 0.54} ${mark * 0.62} Z`}
            fill="url(#xval_g_lime)"
            opacity={0.95}
          />
        </g>

        <circle
          cx={mark * 0.8}
          cy={mark * 0.22}
          r={Math.max(3, Math.round(mark * 0.065))}
          fill={brand.magenta}
        />
      </svg>

      {wordmark && (
        <div className="leading-none">
          <div className="flex items-baseline">
            <span
              className="font-black"
              style={{
                fontFamily: family,
                fontSize: Math.round(s * 0.96),
                letterSpacing: wordSpacing,
                color: '#FFFFFF',
              }}
            >
              X
            </span>
            <span
              className="font-black"
              style={{
                fontFamily: family,
                fontSize: Math.round(s * 0.96),
                letterSpacing: wordSpacing,
                color: brand.lime,
              }}
            >
              {'{'}
            </span>
            <span
              className="font-black"
              style={{
                fontFamily: family,
                fontSize: Math.round(s * 0.96),
                letterSpacing: wordSpacing,
                color: '#FFFFFF',
              }}
            >
              val
            </span>
            <span
              className="font-black"
              style={{
                fontFamily: family,
                fontSize: Math.round(s * 0.96),
                letterSpacing: wordSpacing,
                color: brand.lime,
              }}
            >
              {'}'}
            </span>
          </div>
          <div className="mt-1 text-xs font-semibold text-white/55">
            exceed, simplify, deliver value
          </div>
        </div>
      )}
    </div>
  );
}

const AREA_LABELS = {
  pt: {
    'Consultoria Estratégica': 'Consultoria Estratégica',
    'Segurança da Informação': 'Segurança da Informação',
    Infraestrutura: 'Infraestrutura',
    DevOps: 'DevOps',
    'Banco de Dados': 'Banco de Dados',
  },
  en: {
    'Consultoria Estratégica': 'Strategic Consulting',
    'Segurança da Informação': 'Information Security',
    Infraestrutura: 'Infrastructure',
    DevOps: 'DevOps',
    'Banco de Dados': 'Databases',
  },
};

function areaTheme(area: Area, brand: BrandPalette) {
  if (area === 'Infraestrutura')
    return { bg: 'rgba(43,108,255,0.14)', fg: brand.blue };
  if (area === 'DevOps') return { bg: rgba(brand.lime, 0.14), fg: brand.lime };
  if (area === 'Segurança da Informação')
    return { bg: 'rgba(255,79,216,0.14)', fg: brand.magenta };
  if (area === 'Consultoria Estratégica')
    return { bg: 'rgba(245,247,255,0.10)', fg: brand.mist };

  // "Banco de Dados" e fallback
  const isLight = brand.base.toLowerCase() === '#f5f7ff';
  return {
    bg: isLight ? 'rgba(10,10,15,0.06)' : 'rgba(255,255,255,0.08)',
    fg: isLight ? 'rgba(10,10,15,0.80)' : 'rgba(255,255,255,0.80)',
  };
}

function buildServices(): Service[] {
  return [
    {
      area: 'Consultoria Estratégica',
      title: {
        pt: 'Plano Diretor de Segurança da Informação',
        en: 'Information Security Master Plan',
      },
      tags: ['PDSI', 'Roadmap'],
      icon: <LineChart className="h-5 w-5" />,
      description: {
        pt: 'Elaboração de plano diretor com diagnóstico, priorização e roadmap, alinhando risco, compliance e execução em ciclos claros.',
        en: 'A pragmatic master plan with assessment, prioritization, and roadmap, aligning risk, compliance, and execution into clear cycles.',
      },
    },
    {
      area: 'Consultoria Estratégica',
      title: {
        pt: 'Estratégia de TI',
        en: 'IT Strategy',
      },
      tags: ['Strategy', 'Operating Model'],
      icon: <Boxes className="h-5 w-5" />,
      description: {
        pt: 'Definição de direcionadores, arquitetura alvo, governança e plano de evolução de TI, com foco em eficiência e previsibilidade.',
        en: 'Definition of principles, target architecture, governance, and an evolution plan for IT, focused on efficiency and predictability.',
      },
    },
    {
      area: 'Consultoria Estratégica',
      title: {
        pt: 'Certificações ISO 27001 e 27701',
        en: 'ISO 27001 and 27701 Certifications',
      },
      tags: ['ISO27001', 'ISO27701'],
      icon: <ShieldCheck className="h-5 w-5" />,
      description: {
        pt: 'Consultoria para preparação, adequação e auditoria, com evidências organizadas e apoio na implementação de controles e políticas.',
        en: 'Support for readiness, implementation, and audit, with organized evidence and hands-on help implementing controls and policies.',
      },
    },

    {
      area: 'Segurança da Informação',
      title: {
        pt: 'Sustentação e Implementação Fortinet',
        en: 'Fortinet Implementation and Support',
      },
      tags: ['FortiGate', 'FortiSIEM', 'FortiAnalyzer', 'FortiEMS'],
      icon: <ShieldCheck className="h-5 w-5" />,
      description: {
        pt: 'Implantação e sustentação de tecnologias Fortinet com hardening, alta disponibilidade, melhoria contínua e operação orientada a evidência.',
        en: 'Implementation and operations for Fortinet technologies with hardening, high availability, continuous improvement, and evidence-driven operations.',
      },
    },
    {
      area: 'Segurança da Informação',
      title: {
        pt: 'Auditoria, Conformidade e Governança',
        en: 'Audit, Compliance, and Governance',
      },
      tags: ['GRC', 'Compliance'],
      icon: <Lock className="h-5 w-5" />,
      description: {
        pt: 'Estruturação de governança, políticas, controles e trilha de evidência, com foco em auditoria sem correria e risco controlado.',
        en: 'Governance, policies, controls, and evidence trail, designed for calm audits and controlled risk.',
      },
    },
    {
      area: 'Segurança da Informação',
      title: {
        pt: 'Avaliação de Riscos e Vulnerabilidades',
        en: 'Risk and Vulnerability Assessment',
      },
      tags: ['Risk', 'Vuln'],
      icon: <Search className="h-5 w-5" />,
      description: {
        pt: 'Identificação e priorização de riscos e vulnerabilidades com plano de tratamento, quick wins e orientação prática para correção.',
        en: 'Identify and prioritize risks and vulnerabilities with a treatment plan, quick wins, and practical remediation guidance.',
      },
    },
    {
      area: 'Segurança da Informação',
      title: {
        pt: 'Pentest e Spearphishing',
        en: 'Penetration Testing and Spear Phishing',
      },
      tags: ['Pentest', 'Spearphishing'],
      icon: <Search className="h-5 w-5" />,
      description: {
        pt: 'Testes ofensivos e simulações para medir exposição real, com relatório acionável, evidências e suporte na remediação.',
        en: 'Offensive testing and simulations to measure real exposure, with actionable reporting, evidence, and remediation support.',
      },
    },
    {
      area: 'Segurança da Informação',
      title: {
        pt: 'Segurança em Nuvem',
        en: 'Cloud Security',
      },
      tags: ['CloudSec', 'IAM', 'CSPM'],
      icon: <Cloud className="h-5 w-5" />,
      description: {
        pt: 'Arquitetura e controles de segurança em AWS e Azure, incluindo identidade, segmentação, logging, postura e conformidade.',
        en: 'Security architecture and controls for AWS and Azure, including identity, segmentation, logging, posture management, and compliance.',
      },
    },
    {
      area: 'Segurança da Informação',
      title: {
        pt: 'SOC, SIEM e Resposta a Incidentes',
        en: 'SOC, SIEM, and Incident Response',
      },
      tags: ['SIEM', 'IR', 'SOC'],
      icon: <Lock className="h-5 w-5" />,
      description: {
        pt: 'Estruturação e melhoria de detecção e resposta, com playbooks, telemetria útil, integração e rotina operacional que fecha o ciclo.',
        en: 'Build and improve detection and response with playbooks, useful telemetry, integrations, and operational routines that close the loop.',
      },
    },
    {
      area: 'Segurança da Informação',
      title: {
        pt: 'Treinamento e Conscientização',
        en: 'Training and Awareness',
      },
      tags: ['Awareness', 'Culture'],
      icon: <Sparkles className="h-5 w-5" />,
      description: {
        pt: 'Programas de conscientização com foco em comportamento, phishing simulado e materiais objetivos para elevar maturidade e reduzir incidentes.',
        en: 'Awareness programs focused on behavior, simulated phishing, and practical materials to raise maturity and reduce incidents.',
      },
    },

    {
      area: 'Infraestrutura',
      title: {
        pt: 'Migração para Nuvem e Modernização',
        en: 'Cloud Migration and Modernization',
      },
      tags: ['AWS', 'Azure', 'Migration'],
      icon: <Cloud className="h-5 w-5" />,
      description: {
        pt: 'Planejamento e execução de migração com risco controlado, padrões de landing zone e foco em disponibilidade e custo.',
        en: 'Migration planning and execution with controlled risk, landing zone standards, and a focus on availability and cost.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Cloud Management e Multi-cloud',
        en: 'Cloud Management and Multi-cloud',
      },
      tags: ['Ops', 'Governance'],
      icon: <Server className="h-5 w-5" />,
      description: {
        pt: 'Gestão do ambiente com processos mínimos, automação e governança de custos para reduzir tickets e aumentar previsibilidade.',
        en: 'Operate the environment with lightweight processes, automation, and cost governance to reduce tickets and increase predictability.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Implementação de SD-WAN',
        en: 'SD-WAN Implementation',
      },
      tags: ['SD-WAN', 'WAN'],
      icon: <Server className="h-5 w-5" />,
      description: {
        pt: 'Projeto e implantação de SD-WAN com foco em disponibilidade, performance e governança, incluindo desenho, rollout e operação.',
        en: 'Design and deployment of SD-WAN focused on availability, performance, and governance, including rollout and operations.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Projeto e Implementação de Redes Corporativas',
        en: 'Corporate Network Design and Implementation',
      },
      tags: ['LAN', 'WAN', 'Routing'],
      icon: <Server className="h-5 w-5" />,
      description: {
        pt: 'Desenho e implementação de redes corporativas com segmentação, redundância e documentação, do core ao acesso.',
        en: 'Corporate network design and implementation with segmentation, redundancy, and documentation, from core to access.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Microssegmentação de Redes',
        en: 'Network Microsegmentation',
      },
      tags: ['Segmentation', 'Zero Trust'],
      icon: <Lock className="h-5 w-5" />,
      description: {
        pt: 'Microssegmentação para reduzir superfície de ataque e conter movimento lateral, com políticas, validação e plano de evolução.',
        en: 'Microsegmentation to reduce attack surface and contain lateral movement, with policies, validation, and an evolution plan.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Configuração e Gestão de VPNs',
        en: 'VPN Configuration and Management',
      },
      tags: ['VPN', 'Remote Access'],
      icon: <Lock className="h-5 w-5" />,
      description: {
        pt: 'Implantação e gestão de VPNs site-to-site e acesso remoto, com hardening, MFA e rotinas de operação e suporte.',
        en: 'Deploy and manage site-to-site and remote access VPNs with hardening, MFA, and operational support routines.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Assessment de Melhores Práticas',
        en: 'Best Practices Assessment',
      },
      tags: ['Best Practices', 'Assessment'],
      icon: <Search className="h-5 w-5" />,
      description: {
        pt: 'Avaliação do ambiente, baseline de melhorias, priorização e plano prático para elevar maturidade e reduzir risco operacional.',
        en: 'Assess the environment, establish an improvement baseline, prioritize, and define a practical plan to raise maturity and reduce operational risk.',
      },
    },
    {
      area: 'Infraestrutura',
      title: {
        pt: 'Suporte e Gestão de TI (Service Desk)',
        en: 'IT Support and Service Desk',
      },
      tags: ['ITSM', 'Service Desk'],
      icon: <Server className="h-5 w-5" />,
      description: {
        pt: 'Operação e sustentação de TI com processos, SLAs e melhoria contínua, reduzindo backlog e aumentando previsibilidade.',
        en: 'IT operations with processes, SLAs, and continuous improvement, reducing backlog and increasing predictability.',
      },
    },

    {
      area: 'DevOps',
      title: {
        pt: 'GitOps e Automação de Deploys',
        en: 'GitOps and Deployment Automation',
      },
      tags: ['GitOps', 'CI/CD'],
      icon: <GitBranch className="h-5 w-5" />,
      description: {
        pt: 'Pipelines e entrega contínua com padrões, guardrails e rollback simples, para acelerar com segurança.',
        en: 'Standardized pipelines and continuous delivery with guardrails and simple rollback, accelerating safely.',
      },
    },
    {
      area: 'DevOps',
      title: {
        pt: 'Infraestrutura como Código (IaC)',
        en: 'Infrastructure as Code (IaC)',
      },
      tags: ['Terraform', 'IaC'],
      icon: <Boxes className="h-5 w-5" />,
      description: {
        pt: 'Automação de infraestrutura com padrões, módulos reutilizáveis, controle de mudança e rastreabilidade, reduzindo drift e retrabalho.',
        en: 'Infrastructure automation with standards, reusable modules, change control, and traceability, reducing drift and rework.',
      },
    },
    {
      area: 'DevOps',
      title: {
        pt: 'Observabilidade e Monitoramento',
        en: 'Observability and Monitoring',
      },
      tags: ['APM', 'Logs', 'Tracing'],
      icon: <LineChart className="h-5 w-5" />,
      description: {
        pt: 'APM, métricas, logs e tracing com foco em diagnóstico rápido, alertas úteis e indicadores que suportam decisões.',
        en: 'APM, metrics, logs, and tracing focused on fast diagnosis, meaningful alerts, and decision-ready indicators.',
      },
    },
    {
      area: 'DevOps',
      title: {
        pt: 'SRE e Confiabilidade',
        en: 'SRE and Reliability',
      },
      tags: ['SRE', 'Reliability', 'SLO'],
      icon: <Timer className="h-5 w-5" />,
      description: {
        pt: 'Práticas de confiabilidade para reduzir incidentes e aumentar previsibilidade, com SLOs, runbooks, postmortems e rituais de operação.',
        en: 'Reliability practices to reduce incidents and increase predictability, with SLOs, runbooks, postmortems, and operational rituals.',
      },
    },
    {
      area: 'DevOps',
      title: {
        pt: 'DevSecOps e Segurança no Fluxo',
        en: 'DevSecOps and Security in the Flow',
      },
      tags: ['SAST', 'DAST', 'Policy'],
      icon: <ShieldCheck className="h-5 w-5" />,
      description: {
        pt: 'Integração de segurança no ciclo de entrega com automação, política como código e evidências prontas para auditoria.',
        en: 'Embed security into delivery with automation, policy as code, and audit-ready evidence generated in the flow.',
      },
    },

    {
      area: 'Banco de Dados',
      title: {
        pt: 'Sustentação de Ambientes Oracle',
        en: 'Oracle Environment Support',
      },
      tags: ['Oracle', 'Performance'],
      icon: <Server className="h-5 w-5" />,
      description: {
        pt: 'Sustentação, tuning, disponibilidade e rotinas operacionais para ambientes Oracle, com foco em estabilidade e performance.',
        en: 'Operations, tuning, availability, and routines for Oracle environments, focused on stability and performance.',
      },
    },
    {
      area: 'Banco de Dados',
      title: {
        pt: 'Sustentação de Ambientes SQL Server',
        en: 'SQL Server Environment Support',
      },
      tags: ['SQL Server', 'HA'],
      icon: <Server className="h-5 w-5" />,
      description: {
        pt: 'Operação e suporte de SQL Server com práticas de alta disponibilidade, backup, performance e governança de mudanças.',
        en: 'SQL Server operations and support with high availability practices, backups, performance tuning, and change governance.',
      },
    },
    {
      area: 'Banco de Dados',
      title: {
        pt: 'Consultoria de Dados',
        en: 'Data Consulting',
      },
      tags: ['Data', 'Governance'],
      icon: <LineChart className="h-5 w-5" />,
      description: {
        pt: 'Apoio em arquitetura e governança de dados, definição de padrões, qualidade, integração e uso para decisão.',
        en: 'Support for data architecture and governance, including standards, quality, integration, and decision use.',
      },
    },
  ];
}

const AREAS: Area[] = [
  'Consultoria Estratégica',
  'Segurança da Informação',
  'Infraestrutura',
  'DevOps',
  'Banco de Dados',
];

const COPY: Record<Lang, Record<string, string>> = {
  pt: {
    nav_services: 'Serviços',
    nav_method: 'Método',
    nav_cases: 'Cases',
    nav_about: 'Sobre',
    nav_contact: 'Contato',
    cta_talk: 'Falar com a XVAL',
    cta_view_services: 'Ver serviços',
    pill_scope: 'Estratégia, segurança, infraestrutura, DevOps e dados',
    pill_highbar: 'com régua alta',
    hero_title: 'Valor em produção, com padrão e evidência.',
    hero_body:
      'A XVAL entra onde o caos vira atraso, incidente e auditoria dolorosa. A gente padroniza o caminho, automatiza evidência e deixa o time entregar mais rápido, com menos risco.',
    hero_cta_diag: 'Quero um diagnóstico',
    hero_cta_method: 'Ver método',
    value_title: 'Painel de valor',
    value_example: 'exemplo',
    value_leadtime: 'Lead time',
    value_leadtime_note: 'redução com pipeline padrão',
    value_flowsec: 'Segurança no fluxo',
    value_flowsec_big: 'evidência pronta',
    value_flowsec_note: 'automatizada para auditoria',
    value_reliability: 'Confiabilidade',
    value_reliability_big: 'menos incidentes',
    value_reliability_note: 'SLOs, runbooks e observabilidade',
    services_title: 'Serviços, do jeito que resolve.',
    services_body:
      'Clique em um card para abrir detalhes. Filtre por área e busque por tema.',
    filter_title: 'Filtro',
    filter_mock: 'mock',
    filter_all: 'Todas',
    search_placeholder: 'Buscar por SD-WAN, ISO, IaC, Fortinet, Oracle...',
    badge_evidence: 'Entregável com evidência',
    method_title: 'Método simples, execução pesada',
    method_body:
      'Sem framework pelo framework. A gente chega, mede, decide e implementa. Tudo com trilha de evidência para você defender em auditoria e no board.',
    method_step1_t: 'Diagnóstico objetivo',
    method_step1_d: 'mapa de risco, gargalos e roadmap curto',
    method_step2_t: 'Padrões e guardrails',
    method_step2_d: 'landing zone, políticas e pipeline padrão',
    method_step3_t: 'Automação no fluxo',
    method_step3_d: 'checks e evidências automáticas',
    method_step4_t: 'Confiabilidade',
    method_step4_d: 'SLOs, runbooks e observabilidade',
    method_cta_plan: 'Quero um plano',
    method_cta_cases: 'Ver exemplos de cases',
    sidebar_title: 'Linhas de Serviços',
    sidebar_stack: 'stack',
    side1_t: 'Estratégia',
    side1_d: 'PDSI, estratégia de TI e ISO 27001/27701',
    side2_t: 'Infraestrutura e Redes',
    side2_d: 'Cloud, SD-WAN, redes, VPNs e service desk',
    side3_t: 'Segurança',
    side3_d: 'Fortinet, GRC, cloud security e resposta a incidentes',
    side4_t: 'DevOps',
    side4_d: 'GitOps, IaC, observabilidade e SRE',
    side5_t: 'Dados',
    side5_d: 'Oracle, SQL Server e consultoria de dados',
    cases_title: 'Cases, do tipo que dá para medir.',
    cases_body:
      'Conteúdos abaixo são exemplos de como escrever case com evidência. Troque pelos seus clientes quando quiser.',
    cases_right_t: 'O que vira case aqui',
    cases_right_d:
      'tempo de deploy, taxa de falha, MTTR, custo, cobertura de evidência e redução de risco operacional.',
    case1_t: 'GitOps com rollback simples',
    case1_d:
      'Padronização de pipeline, ambientes consistentes e trilha de evidência no deploy.',
    case1_a: 'Lead time menor e menos regressões',
    case2_t: 'Observabilidade para reduzir MTTR',
    case2_d:
      'APM, logs e tracing com dashboards mínimos, alertas úteis e runbooks.',
    case2_a: 'Incidentes resolvidos mais rápido',
    case3_t: 'DevSecOps com evidência automática',
    case3_d:
      'Policy as code, checks de IaC e relatórios de conformidade sem esforço manual.',
    case3_a: 'Auditoria sem pânico',
    about_title: 'Sobre a XVAL',
    about_p1:
      'Consultoria fundada por três sócios com histórico de construir e liderar práticas de estratégia, cloud, segurança, auditoria e DevOps. O foco é execução com padrão, resultado mensurável e autonomia para o cliente.',
    about_p2:
      'A estética e a comunicação aqui são diretas, menos teatro, mais entrega. A marca só promete o que consegue evidenciar.',
    about_card_1_t: 'Entrega acima do esperado',
    about_card_1_d: 'o padrão é surpreender, não apenas cumprir',
    about_card_2_t: 'Valor mensurável',
    about_card_2_d: 'métricas simples e evidência no fluxo',
    contact_title: 'Vamos destravar sua entrega?',
    contact_body:
      'Deixa seus dados aqui que a gente volta com um plano simples, escopo enxuto e uma proposta que amarra problema, plano e sucesso medível.',
    form_name: 'Seu nome',
    form_email: 'E-mail',
    form_company: 'Empresa',
    form_need: 'O que você quer destravar?',
    form_send: 'Enviar',
    form_note:
      'Mock funcional, sem integração real. Dá para plugar RD, HubSpot ou formulário próprio.',
    alert_send:
      'Mock: aqui entraria o envio do formulário (ex: HubSpot, RD, etc).',
    footer_tagline: 'Valor em produção, com régua alta',
    modal_subtitle: 'Mock navegável, clique fora para fechar',
    modal_close: 'Fechar',
    modal_hint:
      'Aqui você pode colocar escopo típico, entregáveis e como isso vira evidência. O objetivo do mock é deixar a navegação e o layout prontos para você trocar o texto.',
    modal_cta: 'Quero isso na minha empresa',
    modal_more: 'Ver mais serviços',
    lang_label: 'Idioma',
  },
  en: {
    nav_services: 'Services',
    nav_method: 'Method',
    nav_cases: 'Case studies',
    nav_about: 'About',
    nav_contact: 'Contact',
    cta_talk: 'Talk to XVAL',
    cta_view_services: 'View services',
    pill_scope: 'Strategy, security, infrastructure, DevOps, and data',
    pill_highbar: 'with a high bar',
    hero_title: 'Value in production, with standards and evidence.',
    hero_body:
      'XVAL steps in when chaos becomes delay, incidents, and painful audits. We standardize the path, automate evidence, and help your team ship faster with less risk.',
    hero_cta_diag: 'Request an assessment',
    hero_cta_method: 'See the method',
    value_title: 'SLO',
    value_example: 'example',
    value_leadtime: 'Lead time',
    value_leadtime_note: 'reduction with a standard pipeline',
    value_flowsec: 'Security in the flow',
    value_flowsec_big: 'evidence ready',
    value_flowsec_note: 'automated for audits',
    value_reliability: 'Reliability',
    value_reliability_big: 'fewer incidents',
    value_reliability_note: 'SLOs, runbooks, and observability',
    services_title: 'Services that actually solve',
    services_body:
      'Click a card to open details. Filter by area and search by topic.',
    filter_title: 'Filter',
    filter_mock: 'mock',
    filter_all: 'All',
    search_placeholder: 'Search for SD-WAN, ISO, IaC, Fortinet, Oracle...',
    badge_evidence: 'Evidence-ready deliverable',
    method_title: 'Simple method, heavy execution',
    method_body:
      'No framework theater. We arrive, measure, decide, and implement. Everything with an evidence trail you can defend in audits and in the boardroom.',
    method_step1_t: 'Objective assessment',
    method_step1_d: 'risk map, bottlenecks, and a short roadmap',
    method_step2_t: 'Standards and guardrails',
    method_step2_d: 'landing zone, policies, and a standard pipeline',
    method_step3_t: 'Automation in the flow',
    method_step3_d: 'checks and automated evidence',
    method_step4_t: 'Reliability',
    method_step4_d: 'SLOs, runbooks, and observability',
    method_cta_plan: 'Request a plan',
    method_cta_cases: 'See case examples',
    sidebar_title: 'Business Lines',
    sidebar_stack: 'stack',
    side1_t: 'Strategy',
    side1_d: 'security master plan, IT strategy, ISO 27001/27701',
    side2_t: 'Infrastructure and Networks',
    side2_d: 'cloud, SD-WAN, networks, VPNs, service desk',
    side3_t: 'Security',
    side3_d: 'Fortinet, GRC, cloud security, incident response',
    side4_t: 'DevOps',
    side4_d: 'GitOps, IaC, observability, SRE',
    side5_t: 'Data',
    side5_d: 'Oracle, SQL Server, data consulting',
    cases_title: 'Case studies you can measure.',
    cases_body:
      'The content below is sample copy showing how to write evidence-based case studies. Swap in real clients whenever you want.',
    cases_right_t: 'What becomes a case study',
    cases_right_d:
      'deploy time, failure rate, MTTR, cost, evidence coverage, and reduced operational risk.',
    case1_t: 'GitOps with simple rollback',
    case1_d:
      'Standard pipeline, consistent environments, and an evidence trail for every deploy.',
    case1_a: 'Lower lead time and fewer regressions',
    case2_t: 'Observability to reduce MTTR',
    case2_d:
      'APM, logs, and tracing with minimal dashboards, useful alerts, and runbooks.',
    case2_a: 'Faster incident resolution',
    case3_t: 'DevSecOps with automated evidence',
    case3_d:
      'Policy as code, IaC checks, and compliance reporting without manual work.',
    case3_a: 'Audits without panic',
    about_title: 'About XVAL',
    about_p1:
      'A consultancy founded by three partners with a track record of building and leading practices across strategy, cloud, security, audit, and DevOps. The focus is standards, measurable outcomes, and customer autonomy.',
    about_p2:
      'The tone here is direct, less theater, more delivery. We only promise what we can evidence.',
    about_card_1_t: 'Delivery above expectations',
    about_card_1_d: 'the default is to surprise, not merely comply',
    about_card_2_t: 'Measurable value',
    about_card_2_d: 'simple metrics and evidence in the flow',
    contact_title: 'Let’s unblock your delivery?',
    contact_body:
      'Leave your details and we will come back with a simple plan, a lean scope, and a proposal that connects problem, plan, and measurable success.',
    form_name: 'Your name',
    form_email: 'Email',
    form_company: 'Company',
    form_need: 'What you want to unblock?',
    form_send: 'Send',
    form_note:
      'Functional mock, no real integration yet. You can plug in HubSpot, RD, or your own form.',
    alert_send:
      'Mock: this is where the form submit would happen (HubSpot, RD, etc).',
    footer_tagline: 'Value in production, high bar',
    modal_subtitle: 'Navigable mock, click outside to close',
    modal_close: 'Close',
    modal_hint:
      'Here you can add typical scope, deliverables, and how this becomes evidence. The goal of this mock is to keep navigation and layout ready so you can swap the copy.',
    modal_cta: 'I want this for my company',
    modal_more: 'View more services',
    lang_label: 'Language',
  },
};

function AreaPill({
  area,
  lang,
  brand,
}: {
  area: Area;
  lang: Lang;
  brand: BrandPalette;
}) {
  const cfg = areaTheme(area, brand);
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.fg,
        border: `1px solid ${cfg.bg}`,
      }}
    >
      {AREA_LABELS[lang][area]}
    </span>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      data-scroll
      className="text-sm font-semibold text-white/70 hover:text-white transition"
    >
      {children}
    </a>
  );
}

function ValuePanel({ lang, brand }: { lang: Lang; brand: BrandPalette }) {
  const c = COPY[lang];
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0F1118] p-5 shadow-sm">
      <div className="flex items-center justify-between"></div>

      <div className="space-y-3">
        <div className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'rgba(43,108,255,0.18)' }}
            >
              <Timer className="h-5 w-5" style={{ color: brand.blue }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white/80">
                {c.value_leadtime}
              </div>
              <div className="mt-1 text-3xl font-black tracking-tight text-white">
                -35%
              </div>
              <div className="mt-1 text-sm font-semibold text-white/60">
                {c.value_leadtime_note}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: rgba(brand.lime, 0.18) }}
            >
              <ShieldCheck className="h-5 w-5" style={{ color: brand.lime }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white/80">
                {c.value_flowsec}
              </div>
              <div className="mt-1 text-2xl font-black tracking-tight text-white">
                {c.value_flowsec_big}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/60">
                {c.value_flowsec_note}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'rgba(255,79,216,0.18)' }}
            >
              <CheckCircle2
                className="h-5 w-5"
                style={{ color: brand.magenta }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white/80">
                {c.value_reliability}
              </div>
              <div className="mt-1 text-2xl font-black tracking-tight text-white">
                {c.value_reliability_big}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/60">
                {c.value_reliability_note}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExvalLandingPageMockNavegavel() {
  useSmoothScroll();

  const all = useMemo(() => buildServices(), []);
  const { lang, setLang } = usePersistedLang();
  const brand = BRAND_DARK;
  const c = COPY[lang];

  const [area, setArea] = useState<'Todas' | Area>('Todas');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    need: '',
  });

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<'idle' | 'ok' | 'error'>('idle');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
  const EMAILJS_TEMPLATE_ID = import.meta.env
    .VITE_EMAILJS_TEMPLATE_ID as string;

  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '';

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();

    if (sending) return;

    if (!recaptchaToken) {
      alert('Confirme o reCAPTCHA antes de enviar.');
      return;
    }

    if (!form.name.trim() || !form.email.trim() || !form.need.trim()) {
      alert('Preencha nome, e-mail e o campo “O que você quer destravar”.');
      return;
    }

    try {
      setSending(true);
      setSent('idle');

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          reply_to: form.email,
          company: form.company,
          need: form.need,

          //param do emailjs p ter o recaptcha
          'g-recaptcha-response': recaptchaToken,
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      );

      setSent('ok');
      setForm({ name: '', email: '', company: '', need: '' });
      setRecaptchaToken(null);
    } catch (err) {
      console.error(err);
      setSent('error');
    } finally {
      setSending(false);
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((s) => (area === 'Todas' ? true : s.area === area))
      .filter((s) => {
        if (!needle) return true;
        const hay =
          `${s.title[lang]} ${s.description[lang]} ${s.tags.join(' ')}`.toLowerCase();
        return hay.includes(needle);
      });
  }, [all, area, q, lang]);

  return (
    <div
      className="min-h-screen theme-dark"
      style={{ backgroundColor: brand.base }}
    >
      <header
        className="sticky top-0 z-40 border-b border-white/10 backdrop-blur"
        style={{ backgroundColor: 'rgba(10,10,15,0.85)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center"
              aria-label="XVAL"
            >
              {/* Brand mark: same style as footer (badge icon + text) */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block leading-tight">
                  <img
                    src={LOGOMARCA_SRC}
                    alt="XVAL"
                    className="h-9 w-auto object-contain"
                  />
                  <div className="hidden lg:block text-xs font-semibold text-white/55">
                    {c.footer_tagline}
                  </div>
                </div>
              </div>
            </a>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="#servicos">{c.nav_services}</NavLink>
            <NavLink href="#metodo">{c.nav_method}</NavLink>
            <NavLink href="#cases">{c.nav_cases}</NavLink>
            <NavLink href="#sobre">{c.nav_about}</NavLink>
            <NavLink href="#contato">{c.nav_contact}</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-1 lg:flex">
              <Globe className="h-4 w-4 text-white/45" />
              <div className="text-xs font-extrabold text-white/60">
                {c.lang_label}
              </div>
              <button
                onClick={() => setLang('pt')}
                className="rounded-xl px-2 py-1 text-xs font-extrabold"
                style={
                  lang === 'pt'
                    ? {
                        backgroundColor: rgba(brand.lime, 0.18),
                        color: brand.lime,
                      }
                    : { color: 'rgba(255,255,255,0.65)' }
                }
              >
                PT-BR
              </button>
              <button
                onClick={() => setLang('en')}
                className="rounded-xl px-2 py-1 text-xs font-extrabold"
                style={
                  lang === 'en'
                    ? {
                        backgroundColor: rgba(brand.lime, 0.18),
                        color: brand.lime,
                      }
                    : { color: 'rgba(255,255,255,0.65)' }
                }
              >
                EN-US
              </button>
            </div>

            <Button
              variant="outline"
              className="hidden rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 lg:inline-flex"
              asChild
            >
              <a href="#contato" data-scroll>
                {c.cta_talk}
              </a>
            </Button>
            <Button
              className="rounded-2xl font-extrabold"
              style={{ backgroundColor: brand.lime, color: '#000' }}
              onClick={() => {
                const el = document.querySelector('#servicos');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {c.cta_view_services}
            </Button>
          </div>
        </div>
      </header>

      <motion.section
        className="mx-auto max-w-6xl px-4 pb-12 pt-10 md:pt-16"
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={REVEAL_VIEWPORT}
        transition={REVEAL_TRANSITION}
      >
        <div className="grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Sparkles className="h-4 w-4" style={{ color: brand.magenta }} />
              <span className="text-xs font-extrabold text-white/70">
                {c.pill_scope}
              </span>
              <span
                className="ml-[-4px] text-xs font-extrabold"
                style={{ color: brand.lime }}
              >
                {c.pill_highbar}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
              <TypewriterText text={c.hero_title} />
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              {c.hero_body}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-2xl text-base font-extrabold"
                style={{ backgroundColor: brand.lime, color: '#000' }}
                asChild
              >
                <a href="#contato" data-scroll>
                  {c.hero_cta_diag}
                </a>
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-white/15 bg-white/5 text-base font-extrabold text-white hover:bg-white/10"
                asChild
              >
                <a href="#metodo" data-scroll>
                  {c.hero_cta_method}
                </a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                'AWS',
                'Azure',
                'Fortinet',
                'SD-WAN',
                'Kubernetes',
                'Terraform',
                'ArgoCD',
                'ISO 27001',
                'Oracle',
                'SQL Server',
              ].map((x) => (
                <Badge
                  key={x}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70"
                >
                  {x}
                </Badge>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            <ValuePanel lang={lang} brand={brand} />
          </div>
        </div>
      </motion.section>

      <motion.section
        id="servicos"
        className="mx-auto max-w-6xl px-4 pb-14"
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={REVEAL_VIEWPORT}
        transition={REVEAL_TRANSITION}
      >
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {c.services_title}
            </h2>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-[#0F1118] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-white">
                  {c.filter_title}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setArea('Todas')}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70 hover:bg-white/10"
                  style={
                    area === 'Todas'
                      ? { borderColor: rgba(brand.lime, 0.5) }
                      : undefined
                  }
                >
                  {c.filter_all}
                </button>
                {AREAS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70 hover:bg-white/10"
                    style={
                      area === a
                        ? { borderColor: rgba(brand.lime, 0.5) }
                        : undefined
                    }
                  >
                    {AREA_LABELS[lang][a]}
                  </button>
                ))}
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/35" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={c.search_placeholder}
                  className="h-11 rounded-2xl border border-white/15 bg-[#0A0A0F] pl-9 text-white placeholder:text-white/35"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {filtered.map((s) => {
            const t = areaTheme(s.area, brand);
            return (
              <motion.button
                key={`${s.area}-${s.title.pt}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSelected(s);
                  setOpen(true);
                }}
                className="group text-left"
              >
                <Card className="h-full rounded-3xl border border-white/10 bg-[#0F1118] shadow-sm transition group-hover:border-white/15">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-1 rounded-2xl p-3"
                          style={{ backgroundColor: t.bg, color: t.fg }}
                        >
                          {s.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <AreaPill area={s.area} lang={lang} brand={brand} />
                            <div className="text-xs font-semibold text-white/50">
                              {s.tags.join(' • ')}
                            </div>
                          </div>
                          <CardTitle className="mt-2 text-lg font-extrabold text-white">
                            {s.title[lang]}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed text-white/70">
                      {s.description[lang]}
                    </div>
                    {/* <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70">
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: brand.lime }}
                      />
                      {c.badge_evidence}
                    </div> */}
                  </CardContent>
                </Card>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        id="metodo"
        className="mx-auto max-w-6xl px-4 pb-14"
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={REVEAL_VIEWPORT}
        transition={REVEAL_TRANSITION}
      >
        <div className="rounded-[28px] border border-white/10 bg-[#0F1118] px-6 py-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <div className="md:col-span-7">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {c.method_title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                {c.method_body}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    t: c.method_step1_t,
                    d: c.method_step1_d,
                    i: <Search className="h-4 w-4" />,
                  },
                  {
                    t: c.method_step2_t,
                    d: c.method_step2_d,
                    i: <Boxes className="h-4 w-4" />,
                  },
                  {
                    t: c.method_step3_t,
                    d: c.method_step3_d,
                    i: <Sparkles className="h-4 w-4" />,
                  },
                  {
                    t: c.method_step4_t,
                    d: c.method_step4_d,
                    i: <Timer className="h-4 w-4" />,
                  },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-2xl p-2"
                        style={{
                          backgroundColor: rgba(brand.lime, 0.14),
                          color: brand.lime,
                        }}
                      >
                        {x.i}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white">
                          {x.t}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white/60">
                          {x.d}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 rounded-2xl text-base font-extrabold"
                  style={{ backgroundColor: brand.lime, color: '#000' }}
                  asChild
                >
                  <a href="#contato" data-scroll>
                    {c.method_cta_plan}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-white/15 bg-white/5 text-base font-extrabold text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#cases" data-scroll>
                    {c.method_cta_cases}
                  </a>
                </Button>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-white">
                    {c.sidebar_title}
                  </div>
                </div>
                <Separator className="my-4 bg-white/10" />

                <div className="space-y-3">
                  {[
                    {
                      t: c.side1_t,
                      d: c.side1_d,
                      i: <LineChart className="h-4 w-4" />,
                      col: brand.mist,
                      bg: 'rgba(245,247,255,0.10)',
                    },
                    {
                      t: c.side2_t,
                      d: c.side2_d,
                      i: <Server className="h-4 w-4" />,
                      col: brand.blue,
                      bg: 'rgba(43,108,255,0.16)',
                    },
                    {
                      t: c.side3_t,
                      d: c.side3_d,
                      i: <ShieldCheck className="h-4 w-4" />,
                      col: brand.magenta,
                      bg: 'rgba(255,79,216,0.16)',
                    },
                    {
                      t: c.side4_t,
                      d: c.side4_d,
                      i: <GitBranch className="h-4 w-4" />,
                      col: brand.lime,
                      bg: rgba(brand.lime, 0.16),
                    },
                    {
                      t: c.side5_t,
                      d: c.side5_d,
                      i: <LineChart className="h-4 w-4" />,
                      col: 'rgba(255,255,255,0.85)',
                      bg: 'rgba(255,255,255,0.08)',
                    },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="rounded-3xl border border-white/10 bg-[#0F1118] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 rounded-2xl p-2"
                          style={{ backgroundColor: x.bg, color: x.col }}
                        >
                          {x.i}
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-white">
                            {x.t}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white/60">
                            {x.d}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="cases"
        className="mx-auto max-w-6xl px-4 pb-14"
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={REVEAL_VIEWPORT}
        transition={REVEAL_TRANSITION}
      >
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {c.cases_title}
            </h2>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-[#0F1118] p-5">
              <div className="text-sm font-extrabold text-white">
                {c.cases_right_t}
              </div>
              <div className="mt-2 text-sm text-white/70">
                {c.cases_right_d}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            { t: c.case1_t, d: c.case1_d, a: c.case1_a },
            { t: c.case2_t, d: c.case2_d, a: c.case2_a },
            { t: c.case3_t, d: c.case3_d, a: c.case3_a },
          ].map((x) => (
            <Card
              key={x.t}
              className="rounded-3xl border border-white/10 bg-[#0F1118] shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-white">
                  {x.t}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed text-white/70">
                  {x.d}
                </div>
                <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-extrabold text-white/80">
                  {x.a}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="sobre"
        className="mx-auto max-w-6xl px-4 pb-14"
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={REVEAL_VIEWPORT}
        transition={REVEAL_TRANSITION}
      >
        <div className="rounded-[28px] border border-white/10 bg-[#0F1118] px-6 py-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {c.about_title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                {c.about_p1}
              </p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                {c.about_p2}
              </p>
            </div>
            <div className="md:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-[#0A0A0F] p-6 text-white">
                <div className="flex items-center gap-3">
                  <XvalLogo
                    logoSrc={LOGO_ICON_SRC}
                    size={44}
                    variant="badge"
                    wordmark={true}
                    font="sans"
                    brand={brand}
                  />
                </div>
                <Separator className="my-4 bg-white/10" />
                <div className="space-y-3 text-sm text-white/85">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 rounded-xl p-2"
                      style={{ backgroundColor: rgba(brand.lime, 0.18) }}
                    >
                      <Sparkles
                        className="h-4 w-4"
                        style={{ color: brand.lime }}
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">
                        {c.about_card_1_t}
                      </div>
                      <div className="mt-1 text-white/70">
                        {c.about_card_1_d}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 rounded-xl p-2"
                      style={{ backgroundColor: 'rgba(43,108,255,0.18)' }}
                    >
                      <LineChart
                        className="h-4 w-4"
                        style={{ color: brand.blue }}
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-white">
                        {c.about_card_2_t}
                      </div>
                      <div className="mt-1 text-white/70">
                        {c.about_card_2_d}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="contato"
        className="mx-auto max-w-6xl px-4 pb-16"
        initial={REVEAL_INITIAL}
        whileInView={REVEAL_ANIMATE}
        viewport={REVEAL_VIEWPORT}
        transition={REVEAL_TRANSITION}
      >
        <div
          className="rounded-[28px] p-8 md:p-10"
          style={{
            background: `linear-gradient(180deg, ${rgba(brand.blue, 0.18)}, rgba(0,0,0,0) 70%), radial-gradient(800px 380px at 20% 40%, ${rgba(brand.lime, 0.24)}, rgba(0,0,0,0) 60%), radial-gradient(800px 380px at 70% 30%, ${rgba(brand.magenta, 0.18)}, rgba(0,0,0,0) 60%)`,
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {c.contact_title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                {c.contact_body}
              </p>
            </div>

            <div className="md:col-span-5">
              <Card className="rounded-3xl border border-white/10 bg-[#0F1118] shadow-sm">
                <CardContent className="p-6">
                  <form className="grid gap-3" onSubmit={handleSend}>
                    <Input
                      className="h-11 rounded-2xl border border-white/15 bg-[#0A0A0F] text-white placeholder:text-white/35"
                      placeholder={c.form_name}
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    <Input
                      className="h-11 rounded-2xl border border-white/15 bg-[#0A0A0F] text-white placeholder:text-white/35"
                      placeholder={c.form_email}
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                    <Input
                      className="h-11 rounded-2xl border border-white/15 bg-[#0A0A0F] text-white placeholder:text-white/35"
                      placeholder={c.form_company}
                      value={form.company}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, company: e.target.value }))
                      }
                    />

                    <div className="relative">
                      <textarea
                        className="min-h-[140px] w-full resize-none rounded-2xl border border-white/15 bg-[#0A0A0F] px-3 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-0"
                        placeholder={c.form_need}
                        value={form.need}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            need: e.target.value.slice(0, 500),
                          }))
                        }
                        maxLength={500}
                      />
                      <div className="mt-1 text-right text-xs font-semibold text-white/50">
                        {form.need.length}/500
                      </div>
                    </div>
                    <div className="mt-1 flex justify-end">
                      <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        theme="dark"
                        onChange={(token) => setRecaptchaToken(token)}
                        onExpired={() => setRecaptchaToken(null)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-12 rounded-2xl text-base font-extrabold"
                      style={{ backgroundColor: brand.lime, color: '#000' }}
                      disabled={sending || !recaptchaToken}
                      title={
                        !recaptchaToken
                          ? 'Confirme o reCAPTCHA para habilitar'
                          : undefined
                      }
                    >
                      {sending ? 'Enviando...' : c.form_send}
                    </Button>

                    {sent === 'ok' && (
                      <div
                        className="text-sm font-semibold"
                        style={{ color: brand.lime }}
                      >
                        Enviado! ✅
                      </div>
                    )}

                    {sent === 'error' && (
                      <div className="text-sm font-semibold text-red-400">
                        Não foi possível enviar. Tente novamente.
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-white/10 bg-[#0A0A0F]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <img
                  src={LOGOMARCA_SRC}
                  alt="XVAL"
                  className="h-7 w-auto object-contain"
                />
                <div className="text-xs font-semibold text-white/55">
                  {c.footer_tagline}
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-white/60">
              <a href="https://xval.com.br/" target="_blank">
                xval.com.br
              </a>{' '}
              • contato@xval.com.br
            </div>
          </div>
        </div>
      </footer>

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:hidden">
        <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <Globe className="h-4 w-4 text-white/45" />
          <div className="text-xs font-extrabold text-white/60">
            {c.lang_label}
          </div>
          <button
            onClick={() => setLang('pt')}
            className="rounded-xl px-2 py-1 text-xs font-extrabold"
            style={
              lang === 'pt'
                ? { backgroundColor: rgba(brand.lime, 0.18), color: brand.lime }
                : { color: 'rgba(255,255,255,0.65)' }
            }
          >
            PT-BR
          </button>
          <button
            onClick={() => setLang('en')}
            className="rounded-xl px-2 py-1 text-xs font-extrabold"
            style={
              lang === 'en'
                ? { backgroundColor: rgba(brand.lime, 0.18), color: brand.lime }
                : { color: 'rgba(255,255,255,0.65)' }
            }
          >
            EN-US
          </button>
        </div>
      </div>
    </div>
  );
}
