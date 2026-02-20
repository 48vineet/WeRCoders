import axiosInstance from "../lib/axios";

export const battleApi = {
  createBattle: async (data) => {
    const response = await axiosInstance.post("/battle/create", data);
    return response.data;
  },
  getActiveBattles: async () => {
    const response = await axiosInstance.get("/battle/active");
    return response.data;
  },
  getBattleByRoomId: async (roomId) => {
    const response = await axiosInstance.get(`/battle/${roomId}`);
    return response.data;
  },
  joinBattle: async (roomId, password) => {
    const response = await axiosInstance.post(`/battle/join/${roomId}`, {
      password,
    });
    return response.data;
  },
  joinBattleByPassword: async (password) => {
    const response = await axiosInstance.post(`/battle/join-by-password`, {
      password,
    });
    return response.data;
  },
  setReady: async (roomId, ready) => {
    const response = await axiosInstance.post(`/battle/${roomId}/ready`, {
      ready,
    });
    return response.data;
  },
  runCode: async (roomId, payload) => {
    const response = await axiosInstance.post(`/battle/${roomId}/run`, payload);
    return response.data;
  },
  submitCode: async (roomId, payload) => {
    const response = await axiosInstance.post(
      `/battle/${roomId}/submit`,
      payload,
    );
    return response.data;
  },
  leaveBattle: async (roomId) => {
    const response = await axiosInstance.post(`/battle/${roomId}/leave`);
    return response.data;
  },
};
