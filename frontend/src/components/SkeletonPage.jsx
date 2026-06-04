import React from "react";

export default function SkeletonPage() {
  return (
    <main className="skeleton-page" aria-busy="true" aria-label="Loading page">
      <style>
        {`
          .skeleton-page {
            min-height: 100vh;
            color: #111c2d;
            background:
              radial-gradient(circle at top left, rgba(253, 118, 26, 0.10), transparent 24rem),
              radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.12), transparent 26rem),
              linear-gradient(180deg, #f8fbff 0%, #f3f7ff 48%, #ffffff 100%);
          }
          .skeleton-page__header {
            height: 56px;
            border-bottom: 1px solid #e5e7eb;
            background: rgba(255, 255, 255, 0.72);
          }
          .skeleton-page__header-inner {
            display: flex;
            width: min(100%, 1120px);
            height: 100%;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin: 0 auto;
            padding: 0 18px;
            box-sizing: border-box;
          }
          .skeleton-page__header-bar {
            height: 14px;
            width: min(52vw, 260px);
            border-radius: 999px;
            background: linear-gradient(90deg, #e8eef7 0%, #fff 50%, #e8eef7 100%);
            background-size: 220% 100%;
            animation: sk-shimmer 1.1s ease-in-out infinite;
          }
          .skeleton-page__header-action {
            width: 112px;
            height: 34px;
            border-radius: 999px;
            background: linear-gradient(90deg, #e8eef7 0%, #fff 50%, #e8eef7 100%);
            background-size: 220% 100%;
            animation: sk-shimmer 1.1s ease-in-out infinite;
          }
          .skeleton-page__body {
            width: min(100%, 1120px);
            margin: 0 auto;
            padding: 18px;
            box-sizing: border-box;
          }
          .skeleton-page__grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
          .skeleton-page__card {
            min-height: 250px;
            border: 1px solid rgba(231, 238, 255, 0.92);
            border-radius: 14px;
            background: #ffffff;
            padding: 14px;
            box-shadow: 0 4px 12px rgba(0, 36, 82, 0.05);
            box-sizing: border-box;
          }
          .skeleton-page__thumb {
            aspect-ratio: 4 / 3;
            border-radius: 10px;
            background: linear-gradient(90deg, #eef3ff 0%, #ffffff 50%, #eef3ff 100%);
            background-size: 220% 100%;
            animation: sk-shimmer 1.1s ease-in-out infinite;
          }
          .skeleton-page__line {
            height: 14px;
            margin-top: 14px;
            border-radius: 999px;
            background: linear-gradient(90deg, #e8eef7 0%, #fff 50%, #e8eef7 100%);
            background-size: 220% 100%;
            animation: sk-shimmer 1.1s ease-in-out infinite;
          }
          .skeleton-page__line--copy {
            width: min(100%, 560px);
          }
          @keyframes sk-shimmer {
            0% { background-position: 0 0; }
            100% { background-position: -220% 0; }
          }
          @media (max-width: 720px) {
            .skeleton-page__body {
              padding: 14px;
            }
            .skeleton-page__header-inner {
              padding: 0 14px;
            }
            .skeleton-page__header-action {
              display: none;
            }
            .skeleton-page__grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <header className="skeleton-page__header">
        <div className="skeleton-page__header-inner">
          <div className="skeleton-page__header-bar" />
          <div className="skeleton-page__header-action" />
        </div>
      </header>
      <section className="skeleton-page__body">
        <div className="skeleton-page__grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <article className="skeleton-page__card" key={index}>
              <div className="skeleton-page__thumb" />
              <div className="skeleton-page__line" />
              <div className="skeleton-page__line skeleton-page__line--copy" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
