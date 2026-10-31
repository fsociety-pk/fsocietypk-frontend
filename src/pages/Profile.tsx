import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  userService,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserProfile,
} from "../services/userService";
import { useAuthStore } from "../store/authStore";
import ProfileOverview, {
  ProfileHeader,
  SolveHistory,
} from "../components/common/ProfileOverview";
import ChallengeBadgeCollection from "../components/common/ChallengeBadgeCollection";
import type { ApiResponse } from "../types";
import PageState from "../components/common/PageState";
import ProfilePhotoEditor from '../components/common/ProfilePhotoEditor';
export default function Profile() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab") || (params.has("badge") ? "badges" : "overview");
  const tab = ["overview", "history", "badges", "edit", "settings"].includes(requestedTab) ? requestedTab : "overview";
  const setTab = (next: string) => setParams({ tab: next });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photoReading, setPhotoReading] = useState(false);
  const editHeading = useRef<HTMLHeadingElement>(null);
  const editRequested = useRef(false);
  const backRequested = useRef(false);
  const openEditor = () => { editRequested.current = true; setTab('edit'); };
  useEffect(() => {
    if (tab === 'edit' && editRequested.current && editHeading.current) {
      editHeading.current.scrollIntoView({ block: 'start', behavior: 'instant' });
      editHeading.current.focus({ preventScroll: true });
      editRequested.current = false;
    }
    if (tab === 'overview' && backRequested.current) {
      document.getElementById('profile-edit-action')?.focus();
      backRequested.current = false;
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser, logout } = useAuthStore();
  const client = useQueryClient();
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["profile", user?._id],
    queryFn: () => userService.getProfile(),
    select: (r) => r.data,
  });
  const edit = useForm<UpdateProfilePayload>();
  const passwords = useForm<ChangePasswordPayload>();
  useEffect(() => {
    if (profile)
      edit.reset({
        username: profile.username,
        bio: profile.bio || "",
        country: profile.country || "",
        isProfilePublic: profile.isProfilePublic ?? true,
        socialLinks: profile.socialLinks || {},
      });
  }, [profile, edit.reset]);
  const update = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      userService.updateProfile(payload),
    onSuccess: async (response) => {
      if (response.data) {
        client.setQueryData<ApiResponse<UserProfile>>(["profile", user?._id], previous => ({ ...response, data: { ...previous?.data, ...response.data } }));
        if (user) setUser({ ...user, ...response.data });
      }
      await Promise.all([client.invalidateQueries({ queryKey: ["publicProfile"] }), client.invalidateQueries({ queryKey: ["leaderboard"] })]);
      setAvatar(null);
      toast.success("Your profile has been updated.");
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message ||
          "Could not save your profile. Please try again.",
      ),
  });
  const passwordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      userService.changePassword(payload),
    onSuccess: () => {
      passwords.reset();
      logout();
      client.clear();
      toast.success("Password updated. Log in with your new password.");
      navigate("/login", { replace: true });
    },
    onError: (error: any) =>
      toast.error(
        error.response?.data?.message || "Could not change your password.",
      ),
  });
  if (isLoading)
    return (
      <div className="page-wrap profile-refresh">
        <PageState loading title="Loading your profile" description="Gathering your progress and recent solves." />
      </div>
    );
  if (isError || !profile)
    return (
      <div className="page-wrap profile-refresh">
        <PageState
          title="Your profile couldn't be loaded"
          description="Reconnect to load your profile and settings."
          retry={() => refetch()}
        />
      </div>
    );
  return (
    <div className="page-wrap profile-refresh">
      <div className="profile-toolbar">
        {profile.isProfilePublic && (
          <Link
            to={"/profile/" + encodeURIComponent(profile.username)}
            className="text-xs text-text-muted inline-flex gap-2 items-center"
          >
            Public profile <ExternalLink size={13} />
          </Link>
        )}
      </div>
      <ProfileHeader profile={profile} onEdit={openEditor} editing={tab === 'edit'} />
      <div className="tabs-line profile-tabs" role="tablist" aria-label="Profile sections" onKeyDown={event => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        const focusedIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const current = Math.max(0, focusedIndex >= 0 ? focusedIndex : buttons.findIndex(button => button.getAttribute('aria-selected') === 'true'));
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        setTab(['overview', 'history', 'badges', 'settings'][next]);
        buttons[next].focus();
      }}>
        {[
          ["overview", "Overview"],
          ["history", "Solve history"],
          ["badges", "Badges"],
          ["settings", "Settings"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={"tab-" + id}
            aria-controls={"panel-" + id}
            aria-selected={tab === id}
            tabIndex={tab === id || (tab === 'edit' && id === 'overview') ? 0 : -1}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="profile-tab-panel" key={tab} role={tab === "edit" ? "region" : "tabpanel"} id={"panel-" + tab} aria-labelledby={tab === "edit" ? "profile-edit-title" : "tab-" + tab}>
        {tab === "overview" && (
          <>
            <ChallengeBadgeCollection profile={profile} limit={4} onViewAll={() => setTab("badges")} />
            <ProfileOverview profile={profile} />
          </>
        )}
        {tab === "history" && (
          <section className="soft-panel">
            <h2>Your solve history</h2>
            <SolveHistory profile={profile} />
          </section>
        )}
        {tab === "badges" && <ChallengeBadgeCollection profile={profile} />}
        {tab === "edit" && (
          <form
            className="profile-editor soft-panel"
            onSubmit={edit.handleSubmit((values) => { if (!photoReading) update.mutate({ ...values, ...(avatar !== null ? { avatar } : {}) }); })}
          >
            <div className="profile-editor-heading"><h2 id="profile-edit-title" ref={editHeading} tabIndex={-1}>Edit profile</h2><button type="button" className="btn-ghost" disabled={update.isPending} onClick={() => { setAvatar(null); edit.reset(); backRequested.current = true; setTab('overview'); }}><ArrowLeft size={15} />Back to profile</button></div>
            <p>
              Your public information and the way you appear to the community.
            </p>
            <ProfilePhotoEditor saved={profile.avatar} preview={avatar} username={profile.username} disabled={update.isPending} onChange={setAvatar} onBusyChange={setPhotoReading} />
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="profile-username">Username</label>
                <input
                  id="profile-username"
                  className="input"
                  {...edit.register("username", {
                    required: "Enter a username.",
                    minLength: {
                      value: 3,
                      message: "Use at least 3 characters.",
                    },
                    maxLength: {
                      value: 30,
                      message: "Use at most 30 characters.",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: "Use letters, numbers, underscores, or hyphens.",
                    },
                  })}
                />
                {edit.formState.errors.username && (
                  <span className="field-error">
                    {edit.formState.errors.username.message}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="profile-country">Country</label>
                <select
                  id="profile-country"
                  className="input"
                  {...edit.register("country")}
                >
                  <option value="">Choose country</option>
                  {[
                    ["PK", "Pakistan"],
                    ["US", "United States"],
                    ["GB", "United Kingdom"],
                    ["IN", "India"],
                    ["CA", "Canada"],
                    ["AU", "Australia"],
                    ["FR", "France"],
                    ["DE", "Germany"],
                    ["BR", "Brazil"],
                    ["JP", "Japan"],
                    ["OTHER", "Other"],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                className="input min-h-28"
                maxLength={200}
                placeholder="Write a short bio."
                {...edit.register("bio")}
              />
              <small>Up to 200 characters.</small>
            </div>
            <div className="form-section">
              <h3>Social links</h3>
              {(["github", "linkedin", "instagram"] as const).map((network) => (
                <div className="form-field" key={network}>
                  <label className="capitalize" htmlFor={"social-" + network}>
                    {network}
                  </label>
                  <input
                    type="url"
                    id={"social-" + network}
                    className="input"
                    placeholder={"https://" + network + ".com/…"}
                    {...edit.register(
                      ("socialLinks." + network) as "socialLinks.github",
                      {
                        validate: (value) =>
                          !value ||
                          /^https?:\/\//i.test(value) ||
                          "Use a complete http or https URL.",
                      },
                    )}
                  />
                  {edit.formState.errors.socialLinks?.[network] && (
                    <span className="field-error">
                      {edit.formState.errors.socialLinks[network]?.message}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="form-section">
              <h3>Profile visibility</h3>
              <label className="flex gap-3 items-start text-sm">
                <input
                  type="checkbox"
                  className="accent-brand mt-1"
                  {...edit.register("isProfilePublic")}
                />
                <span>
                  Make my profile public
                  <small className="block text-text-muted mt-1">
                    Allow other members to view your bio and progress.
                  </small>
                </span>
              </label>
            </div>
            <div className="form-actions">
              <button className="btn-primary" disabled={update.isPending || photoReading}>
                <Save size={16} />
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => { edit.reset(); setAvatar(null); }}
              >
                Reset changes
              </button>
            </div>
          </form>
        )}
        {tab === "settings" && (
          <form
            className="profile-editor soft-panel"
            onSubmit={passwords.handleSubmit((values) =>
              passwordMutation.mutate(values),
            )}
          >
            <h2>Keep your account secure.</h2>
            <p>Choose a unique password you haven't used elsewhere.</p>
            {(
              [
                { key: "currentPassword", label: "Current password" },
                { key: "newPassword", label: "New password" },
                { key: "confirmPassword", label: "Confirm new password" },
              ] as const
            ).map(({ key, label }) => (
              <div className="form-field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  className="input"
                  autoComplete={
                    key === "currentPassword"
                      ? "current-password"
                      : "new-password"
                  }
                  type={showPassword ? "text" : "password"}
                  {...passwords.register(key, {
                    required: "This field is required.",
                    ...(key === "newPassword"
                      ? {
                          minLength: {
                            value: 8,
                            message: "Use at least 8 characters.",
                          },
                          validate: (value: string) =>
                            (/[A-Z]/.test(value) &&
                              /[a-z]/.test(value) &&
                              /[0-9]/.test(value) &&
                              /[^a-zA-Z0-9]/.test(value)) ||
                            "Include uppercase, lowercase, a number, and a special character.",
                        }
                      : {}),
                    ...(key === "confirmPassword"
                      ? {
                          validate: (value: string) =>
                            value === passwords.getValues("newPassword") ||
                            "Passwords must match.",
                        }
                      : {}),
                  })}
                />
                {passwords.formState.errors[key] && (
                  <span className="field-error">
                    {passwords.formState.errors[key]?.message}
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-text-muted inline-flex items-center gap-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}{" "}
              {showPassword ? "Hide" : "Show"} passwords
            </button>
            <div className="form-actions">
              <button
                className="btn-primary"
                disabled={passwordMutation.isPending}
              >
                {passwordMutation.isPending ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
