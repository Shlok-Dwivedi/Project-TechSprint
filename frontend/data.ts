
import { UserProfile, Topic, CommunityPost } from "./types";

export const MOCK_USER: UserProfile = {
  name: "Alex Dev",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  reputation: 1250,
  expertise: "Expert",
};

export const MOCK_TOPICS: Topic[] = [
  { id: "1", title: "Arrays & Hashing", status: "Mastered", progress: 15, total: 15, icon: "fa-layer-group" },
  { id: "2", title: "Two Pointers", status: "Mastered", progress: 8, total: 10, icon: "fa-arrows-left-right" },
  { id: "3", title: "Linked Lists", status: "Weak", progress: 3, total: 12, icon: "fa-link" },
  { id: "4", title: "Trees", status: "In Progress", progress: 5, total: 18, icon: "fa-network-wired" },
  { id: "5", title: "Dynamic Programming", status: "Weak", progress: 2, total: 20, icon: "fa-cubes-stacked" },
  { id: "6", title: "Graphs", status: "In Progress", progress: 4, total: 15, icon: "fa-circle-nodes" },
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    topicId: "1", // Linked to Arrays & Hashing (Two Sum context)
    author: {
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      expertise: "Expert"
    },
    title: "Optimized One-Pass Solution using HashMap",
    code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    language: "python",
    aiRelevance: 98,
    weightedScore: 142,
    timestamp: "2h ago"
  },
  {
    id: "p2",
    topicId: "1",
    author: {
      name: "JuniorDev_99",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JD",
      expertise: "Beginner"
    },
    title: "My attempt using nested loops (Getting TLE?)",
    code: `for i in range(len(nums)):
    for j in range(len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]`,
    language: "python",
    aiRelevance: 45,
    weightedScore: -3,
    aiWarning: "Misconception: This solution uses the same element twice (when i == j) which is forbidden. Additionally, O(n²) complexity causes Time Limit Exceeded.",
    timestamp: "5h ago"
  },
  {
    id: "p3",
    topicId: "1",
    author: {
      name: "AlgoMaster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Algo",
      expertise: "Intermediate"
    },
    title: "C++ Two Pointers approach (Requires Sorted Array)",
    code: `// Note: This only works if array is sorted!
int left = 0, right = nums.size() - 1;
while(left < right) {
    int sum = nums[left] + nums[right];
    if(sum == target) return {left, right};
    else if(sum < target) left++;
    else right--;
}`,
    language: "cpp",
    aiRelevance: 60,
    weightedScore: 12,
    aiWarning: "Context Alert: The standard Two Sum problem usually provides an unsorted array. This approach requires O(n log n) sorting first, which changes the original indices.",
    timestamp: "1d ago"
  }
];
