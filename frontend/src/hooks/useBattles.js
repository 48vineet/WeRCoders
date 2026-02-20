import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { battleApi } from "../api/battles";

export const useCreateBattle = () =>
  useMutation({
    mutationKey: ["createBattle"],
    mutationFn: battleApi.createBattle,
    onSuccess: () => toast.success("Battle created successfully"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to create battle"),
  });

export const useActiveBattles = () =>
  useQuery({
    queryKey: ["activeBattles"],
    queryFn: battleApi.getActiveBattles,
  });

export const useBattleByRoomId = (roomId) =>
  useQuery({
    queryKey: ["battle", roomId],
    queryFn: () => battleApi.getBattleByRoomId(roomId),
    enabled: !!roomId,
    refetchInterval: (data) => {
      const status = data?.battle?.status;
      // Refetch when waiting (for ready updates) or countdown (for status changes)
      return status === "waiting" || status === "countdown"
        ? 2000
        : status === "finished"
          ? 5000
          : false;
    },
  });

export const useJoinBattle = (roomId) =>
  useMutation({
    mutationKey: ["joinBattle", roomId],
    mutationFn: ({ password }) => battleApi.joinBattle(roomId, password),
    onSuccess: () => toast.success("Joined battle successfully"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to join battle"),
  });

export const useReadyBattle = (roomId, userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["readyBattle", roomId],
    mutationFn: (ready) => battleApi.setReady(roomId, ready),
    onMutate: async (ready) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["battle", roomId] });

      // Snapshot current value
      const previous = queryClient.getQueryData(["battle", roomId]);

      // Optimistically update to the new value
      if (userId) {
        queryClient.setQueryData(["battle", roomId], (old) => {
          if (!old?.battle) return old;
          return {
            ...old,
            battle: {
              ...old.battle,
              participants: old.battle.participants.map((p) =>
                p.userId === userId ? { ...p, ready } : p,
              ),
            },
          };
        });
      }

      return { previous };
    },
    onSuccess: () => toast.success("Ready status updated"),
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["battle", roomId], context.previous);
      }
      toast.error(error.response?.data?.message || "Failed to update ready");
    },
    onSettled: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ["battle", roomId] });
    },
  });
};

export const useRunBattleCode = (roomId) =>
  useMutation({
    mutationKey: ["runBattle", roomId],
    mutationFn: (payload) => battleApi.runCode(roomId, payload),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to run code"),
  });

export const useSubmitBattleCode = (roomId) =>
  useMutation({
    mutationKey: ["submitBattle", roomId],
    mutationFn: (payload) => battleApi.submitCode(roomId, payload),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to submit code"),
  });

export const useLeaveBattle = (roomId) =>
  useMutation({
    mutationKey: ["leaveBattle", roomId],
    mutationFn: () => battleApi.leaveBattle(roomId),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to leave battle"),
  });
