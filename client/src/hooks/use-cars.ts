import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CarInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCars() {
  return useQuery({
    queryKey: [api.cars.list.path],
    queryFn: async () => {
      const res = await fetch(api.cars.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null; // Handle unauthorized gracefully
        throw new Error("Failed to fetch cars");
      }
      return api.cars.list.responses[200].parse(await res.json());
    },
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: [api.cars.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cars.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch car details");
      return api.cars.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CarInput) => {
      const res = await fetch(api.cars.create.path, {
        method: api.cars.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create car");
      }
      return api.cars.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({
        title: "Success",
        description: "Car added successfully to the inventory.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cars.delete.path, { id });
      const res = await fetch(url, { 
        method: api.cars.delete.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete car");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({
        title: "Deleted",
        description: "Car removed from the system.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete the car. Please try again.",
        variant: "destructive",
      });
    }
  });
}
