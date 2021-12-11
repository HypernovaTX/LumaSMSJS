import { useDownload } from 'api/apiCore';
import {
  APIPropTemplate,
  APIResponse,
  OnComplete,
  OnError,
} from 'schema/apiSchema';

// Get image
export function useAPI_image(props: GetImageProps) {
  return useDownload(props) as APIResponse<any, GetImageBody>;
}

// Body Types
type GetImageBody = { path: string };
interface GetImageProps extends APIPropTemplate {
  body: GetImageBody;
  skip: boolean;
  onComplete?: OnComplete<any>;
  onError?: OnError;
}
