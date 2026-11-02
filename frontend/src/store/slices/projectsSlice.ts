import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import { Project } from "@/lib/types";

interface ProjectsState {
  projects: Project[];
  total: number;
  currentProject: Project | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  total: 0,
  currentProject: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (
    params: { search?: string; sortBy?: string; order?: string } | void,
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get("/projects", { params: params || {} });
      return {
        projects: res.data.data.projects as Project[],
        total: res.data.data.total as number,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load projects";
      return rejectWithValue(message);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      return res.data.data.project as Project;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load project details";
      return rejectWithValue(message);
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (data: { title: string; description?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/projects", data);
      return res.data.data.project as Project;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create project";
      return rejectWithValue(message);
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async (
    { id, data }: { id: string; data: { title?: string; description?: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/projects/${id}`, data);
      return res.data.data.project as Project;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update project";
      return rejectWithValue(message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      return rejectWithValue(message);
    }
  }
);

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.total = action.payload.total;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load projects";
      });

    // Fetch Project By ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Project not found";
      });

    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.actionLoading = false;
        state.projects.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) || "Failed to create project";
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.actionLoading = false;
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = { ...state.projects[index], ...action.payload };
        }
        if (state.currentProject && state.currentProject._id === action.payload._id) {
          state.currentProject = { ...state.currentProject, ...action.payload };
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) || "Failed to update project";
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.actionLoading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        if (state.currentProject && state.currentProject._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = (action.payload as string) || "Failed to delete project";
      });
  },
});

export const { clearCurrentProject, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
