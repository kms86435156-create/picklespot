import { notFound } from "next/navigation";
import { getContentBySlug, getPublishedContents } from "@/lib/contents";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getContentBySlug(params.slug);
  if (!c) return { title: "가이드 - PBL.SYS" };
  const desc = c.body?.replace(/[#*\n]/g, " ").trim().slice(0, 160) || "";
  return {
    title: `${c.title} - PBL.SYS`,
    description: desc,
    openGraph: { title: `${c.title} - PBL.SYS`, description: desc },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const content = getContentBySlug(params.slug);
  if (!content) notFound();

  const allGuides = getPublishedContents().filter((c: any) => c.slug !== params.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-dark pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-brand-cyan transition-colors">홈</Link>
          <span>/</span>
          <span className="text-white">{content.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{content.title}</h1>

        {/* Body — simple markdown rendering */}
        <article className="prose-dark">
          {renderMarkdown(content.body || "")}
        </article>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-brand-cyan/10 to-brand-red/5 border border-brand-cyan/20 rounded-lg p-6 text-center">
          <p className="font-bold text-white mb-2">피클볼 동호회를 운영하고 계신가요?</p>
          <p className="text-sm text-text-muted mb-4">대회 접수, 회원 관리, 일정 관리를 무료로 시작하세요.</p>
          <Link href="/for-clubs" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan text-dark font-bold text-sm rounded hover:bg-brand-cyan/90 transition-colors">
            무료 사전등록
          </Link>
        </div>

        {/* Related guides */}
        {allGuides.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-4">다른 가이드</h2>
            <div className="space-y-2">
              {allGuides.map((g: any) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="block">
                  <div className="bg-surface border border-ui-border rounded-lg p-4 hover:border-brand-cyan/30 transition-all group">
                    <p className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors">{g.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 간단한 markdown → React 변환 (외부 라이브러리 없이) */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.slice(2)}</h2>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-sm text-white/80 my-3">
          {items.map((item, j) => <li key={j}>{inlineFormat(item)}</li>)}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      // skip
    } else {
      elements.push(<p key={i} className="text-sm text-white/80 leading-relaxed my-2">{inlineFormat(line)}</p>);
    }
    i++;
  }
  return <>{elements}</>;
}

function inlineFormat(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
