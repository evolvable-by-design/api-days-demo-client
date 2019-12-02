import { useLocation } from 'react-router-dom'
import qs from 'qs'

function useQuery() {
  return qs.parse(useLocation().search.substring(1))
}

export default useQuery