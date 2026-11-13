export interface ApiResponseProps<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ApiResponse = <T>(
  data: T,
  message: string
): ApiResponseProps<T> => ({
  success: true,
  message,
  data
});
