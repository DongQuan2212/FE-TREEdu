// adapters/react-router-adapter.js
import { useNavigate } from 'react-router-dom';

export const useRouterAdapter = () => {
    const navigate = useNavigate();
    return { navigate };
};
