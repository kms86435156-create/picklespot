import { MessageSquareText } from "lucide-react";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata = {
  title: "피드백 | 피클스팟",
  description: "서비스 개선을 위한 피드백을 보내주세요",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-dark pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquareText className="w-6 h-6 text-brand-cyan" />
            피드백
          </h1>
          <p className="text-sm text-text-muted mt-1">
            서비스 개선을 위한 소중한 의견을 보내주세요. 버그 신고, 기능 제안, 문의 등 무엇이든 환영합니다.
          </p>
        </div>

        <div className="bg-surface border border-ui-border rounded-lg p-6">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
