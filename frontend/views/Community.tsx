import React from "react";
import { CommunityFeed } from "../components/CommunityFeed";

export const Community = () => {
  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Community Solutions</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Explore and learn from community-submitted solutions to algorithmic problems.
            Vote on your favorites and contribute your own approaches.
          </p>
        </div>

        <CommunityFeed topicId="all" />
      </div>
    </div>
  );
};
