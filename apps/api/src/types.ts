export type TinyFishRecord = {
  category_name: string;
  url: string;
  run_id: string;
  final_run_data?: {
    status?: string;
    result?: {
      result?: unknown;
    };
  };
};
