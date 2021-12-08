import { APIResponse, OnComplete, useDownload } from 'API/apiCore';

// Get image
export function useAPI_image(
  skip: boolean,
  body: GetImageBody,
  done?: OnComplete<any>
) {
  const completeFunction = done ? done : () => {};
  return useDownload(completeFunction, skip, body) as APIResponse<
    any,
    GetImageBody
  >;
}

// Body Types
type GetImageBody = {
  path: string;
};
