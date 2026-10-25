import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Award,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  userService,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "../services/userService";
import { useAuthStore } from "../store/authStore";
import ProfileOverview, {
  ProfileHeader,
  SolveHistory,
} from "../components/common/ProfileOverview";
import CertificateModal from "../components/common/CertificateModal";
import PageState from "../components/common/PageState";
export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [certificate, setCertificate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser, logout } = useAuthStore();
  const client = useQueryClient();
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
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
        client.setQueryData(["profile"], response);
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
  const chooseAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      toast.error("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("This image could not be read.");
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => toast.error("This image could not be opened.");
      image.onload = () => {
        const size = Math.min(image.width, image.height);
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.drawImage(
          image,
          (image.width - size) / 2,
          (image.height - size) / 2,
          size,
          size,
          0,
          0,
          400,
          400,
        );
        setAvatar(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  if (isLoading)
    return (
      <div className="page-wrap">
        <PageState loading />
      </div>
    );
  if (isError || !profile)
    return (
      <div className="page-wrap">
        <PageState
          title="Your profile couldn't be loaded"
          description="Reconnect to load your profile and settings."
          retry={() => refetch()}
        />
      </div>
    );
  const count = profile.solvedChallenges?.length || 0;
  const latestCompletion = profile.solveHistory?.find(solve => solve.isCorrect && solve.pointsAwarded > 0);
  return (
    <div className="page-wrap">
      <div className="flex justify-between items-center">
        <span className="eyebrow">My profile</span>
        {profile.isProfilePublic && (
          <Link
            to={"/profile/" + encodeURIComponent(profile.username)}
            className="text-xs text-text-muted inline-flex gap-2 items-center"
          >
            Public profile <ExternalLink size={13} />
          </Link>
        )}
      </div>
      <ProfileHeader
        profile={profile}
        avatar={
          <div className="profile-avatar">
            {avatar || profile.avatar ? (
              <img src={avatar || profile.avatar} alt={profile.username} />
            ) : (
              profile.username[0].toUpperCase()
            )}
            <label className="avatar-edit">
              <Camera size={24} />
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Upload profile photo"
                onChange={chooseAvatar}
              />
            </label>
          </div>
        }
      />
      {avatar && (
        <div className="notice flex items-center gap-4 flex-wrap my-5">
          <span>Ready to use this profile photo?</span>
          <button
            className="btn-primary"
            disabled={update.isPending}
            onClick={() => update.mutate({ avatar })}
          >
            <Check size={15} />
            {update.isPending ? "Saving…" : "Save photo"}
          </button>
          <button className="btn-ghost" onClick={() => setAvatar(null)}>
            <X size={15} />
            Cancel
          </button>
        </div>
      )}
      <div className="tabs-line" role="tablist" aria-label="Profile sections">
        {[
          ["overview", "Overview"],
          ["history", "Solve history"],
          ["certificates", "Certificates"],
          ["edit", "Edit profile"],
          ["settings", "Settings"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={"tab-" + id}
            aria-controls={"panel-" + id}
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={"panel-" + tab} aria-labelledby={"tab-" + tab}>
        {tab === "overview" && (
          <>
            <ProfileOverview profile={profile} />
            <div className="certificate-banner">
              <Award size={28} />
              <div>
                <h3>
                  {count >= 5
                    ? "Your certificates"
                    : "Small steps. Real progress."}
                </h3>
                <p>
                  {count >= 5
                    ? "View and share your challenge achievement certificate."
                    : "Complete five challenges to unlock your profile certificate."}
                </p>
              </div>
              <button
                className="btn-outline"
                onClick={() => setTab("certificates")}
              >
                View certificates
              </button>
            </div>
          </>
        )}
        {tab === "history" && (
          <section className="soft-panel">
            <h2>Your solve history</h2>
            <SolveHistory profile={profile} />
          </section>
        )}
        {tab === "certificates" && (
          <section className="soft-panel">
            <span className="eyebrow mb-5">Certificates</span>
            <h2>Achievement certificates</h2>
            <p className="text-sm text-text-muted mb-7">
              Your profile certificate becomes available after five completed
              challenges. Individual challenge certificates are available on
              completed challenge pages.
            </p>
            {count >= 5 ? (
              <button
                className="btn-primary"
                onClick={() => setCertificate(true)}
              >
                <Award size={17} />
                View achievement certificate
              </button>
            ) : (
              <div className="notice">
                <strong>{count} of 5 challenges completed</strong>
                <div className="progress-track my-3">
                  <div
                    style={{ width: Math.min(100, (count / 5) * 100) + "%" }}
                  />
                </div>
                <Link to="/challenges" className="text-brand underline">
                  Find your next challenge
                </Link>
              </div>
            )}
          </section>
        )}
        {tab === "edit" && (
          <form
            className="profile-editor soft-panel"
            onSubmit={edit.handleSubmit((values) => update.mutate(values))}
          >
            <h2>Profile details</h2>
            <p>
              Your public information and the way you appear to the community.
            </p>
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
              <button className="btn-primary" disabled={update.isPending}>
                <Save size={16} />
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => edit.reset()}
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
      <CertificateModal
        isOpen={certificate}
        onClose={() => setCertificate(false)}
        data={{
          userName: profile.username,
          challengeName: count + " Cybersecurity Challenges",
          completionDate: latestCompletion?.timestamp ? new Date(latestCompletion.timestamp) : null,
          totalChallenges: count,
          platformName: "Fsociety PK",
          platformURL: "https://fsocietypk.tech",
        }}
      />
    </div>
  );
}
