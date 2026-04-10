import api from './index';

// 식물 도감은 로컬 JSON(plants.json)을 직접 사용합니다.
// 산림청 외부 API 엔드포인트는 제거되었습니다.

export const plantApi = {
  diagnose: (data) =>
    api.post('/api/diagnosis', data),
};

export default plantApi;
