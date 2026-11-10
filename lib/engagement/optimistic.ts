export type ArticleComment = {
  id: string;
  nickname: string;
  body: string;
  createdAt: number;
  pending?: boolean;
};

export type EngagementState = {
  comments: ArticleComment[];
  commentCount: number;
  likeCount: number;
  liked: boolean;
  nextCursor: string | null;
};

type LikeState = Pick<EngagementState, "liked" | "likeCount">;

export function startLike(state: EngagementState, liked: boolean): EngagementState {
  return {
    ...state,
    liked,
    likeCount: Math.max(0, state.likeCount + (state.liked === liked ? 0 : liked ? 1 : -1)),
  };
}

export function restoreLike(state: EngagementState, before: LikeState): EngagementState {
  return { ...state, liked: before.liked, likeCount: before.likeCount };
}

export function startComment(state: EngagementState, comment: ArticleComment): EngagementState {
  if (state.comments.some(item => item.id === comment.id)) return state;
  return { ...state, comments: [{ ...comment, pending: true }, ...state.comments], commentCount: state.commentCount + 1 };
}

export function confirmComment(state: EngagementState, comment: ArticleComment): EngagementState {
  if (!state.comments.some(item => item.id === comment.id)) {
    return { ...state, comments: [comment, ...state.comments], commentCount: state.commentCount + 1 };
  }
  return { ...state, comments: state.comments.map(item => item.id === comment.id ? comment : item) };
}

export function removePendingComment(state: EngagementState, id: string): EngagementState {
  if (!state.comments.some(item => item.id === id && item.pending)) return state;
  return { ...state, comments: state.comments.filter(item => item.id !== id), commentCount: Math.max(0, state.commentCount - 1) };
}
