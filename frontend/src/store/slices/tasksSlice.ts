import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { Task, DashboardStats, TaskStatus } from "@/lib/types";

interface TasksState {
  tasks: Task[];
  total: number;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  statsLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  total: 0,
  dashboardStats: null,
  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (
    params:
      | {
          status?: string;
          dueDate?: string;
          sortBy?: string;
          order?: string;
          projectId?: string;
          search?: string;
        }
      | void,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get("/tasks", { params: params || {} });
      return {
        tasks: res.data.data.tasks as Task[],
        total: res.data.data.total as number,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load tasks";
      return rejectWithValue(message);
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  "tasks/fetchProjectTasks",
  async (
    {
      projectId,
      params = {},
    }: {
      projectId: string;
      params?: { status?: string; dueDate?: string; sortBy?: string; order?: string; search?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`, { params });
      return {
        tasks: res.data.data.tasks as Task[],
        total: res.data.data.total as number,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load project tasks";
      return rejectWithValue(message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (
    {
      projectId,
      data,
    }: {
      projectId: string;
      data: {
        title: string;
        description?: string;
        status?: TaskStatus;
        dueDate?: string | null;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, data);
      return res.data.data.task as Task;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        dueDate?: string | null;
        projectId?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);
      return res.data.data.task as Task;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update task";
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      return rejectWithValue(message);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "tasks/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tasks/dashboard-stats");
      return res.data.data as DashboardStats;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard statistics";
      return rejectWithValue(message);
    }
  }
);

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasksError: (state) => {
      state.error = null;
    },
    optimisticStatusChange: (
      state,
      action: PayloadAction<{ id: string; status: TaskStatus }>
    ) => {
      const task = state.tasks.find((t) => t._id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load tasks";
      });

    // Fetch Project Tasks
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load project tasks";
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.actionLoading = false;
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) || "Failed to create task";
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.actionLoading = false;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) || "Failed to update task";
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.actionLoading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) || "Failed to delete task";
      });

    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.statsLoading = false;
      });
  },
});

export const { clearTasksError, optimisticStatusChange } = tasksSlice.actions;
export default tasksSlice.reducer;
