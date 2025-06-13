import api from "./api.ts";
import axios from "axios";

const apiService = {
    getAllPython: async <T>(endpoint: string): Promise<T[]> => {
        const response = await axios.get<T[]>(`http://localhost/${endpoint}`);
        return response.data;
    },

    getAll: async <T>(endpoint: string): Promise<T> => {
        const response = await api.get<T>(endpoint);
        return response.data;
    },

    getById: async <T>(endpoint: string, id: string): Promise<T> => {
        const response = await api.get<T>(`${endpoint}/${id}`);
        return response.data;
    },

    create: async <T>(endpoint: string, data: T): Promise<T> => {
        const response = await api.post<T>(endpoint, data);
        return response.data;
    },

    createReqRes: async <T extends object, D>(
        endpoint: string,
        data: T
    ): Promise<D> => {
        const response = await api.post<D>(endpoint, data);
        return response.data;
    },

    update: async <T>(endpoint: string, id: string, data?: T): Promise<T> => {
        const response = await api.patch<T>(`${endpoint}/${id}`, data);
        return response.data;
    },

    delete: async (endpoint: string, id: string): Promise<void> => {
        await api.delete(`${endpoint}/${id}`);
    },

    addUser: async <T>(
        endpoint: string,
        userId: string,
        roomId: string
    ): Promise<T> => {
        const { data: userData } = await api.post<T>(`${endpoint}`, {
            userId,
            roomId,
        });
        return userData;
    },

    addUserRoom: async <T>(
        endpoint: string,
        userIds: string[],
        roomId: string
    ): Promise<T> => {
        const { data: userDataRoom } = await api.post<T>(
            `${endpoint.replace(":roomId", roomId)}`,
            { userIds }
        );
        return userDataRoom;
    },
    addUserToTopic: async <T>(
        endpoint: string,
        userIds: string[],
        topicId: string
    ): Promise<T> => {
        const { data } = await api.post<T>(`${endpoint}`, { userIds, topicId });
        return data;
    },

    addUsersToTopic: async <T>(
        endpoint: string,
        userTopicMany: { userId: string; topicId: string }[]
    ): Promise<T[]> => {
        const { data: topicData } = await api.post<T[]>(
            `${endpoint}`,
            userTopicMany
        );
        return topicData;
    },

    addUsers: async <T>(
        endpoint: string,
        userId: string,
        topicId: string
    ): Promise<T> => {
        const { data: topicData } = await api.post<T>(`${endpoint}`, {
            userId,
            topicId,
        });
        return topicData;
    },

    removeUser: async <T>(
        endpoint: string,
        userId: string,
        roomId: string
    ): Promise<void> => {
        await api.delete<T>(`${endpoint}/${userId}/${roomId}`);
    },
};

export default apiService;