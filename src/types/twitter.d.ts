export interface TwitterFriendsList {
  ids: number[];
  next_cursor: number;
  next_cursor_str: string;
  previous_cursor: number;
  previous_cursor_str: string;
  total_count: number | null;
}
