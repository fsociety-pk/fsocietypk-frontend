import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import ProfileOverview, {
  ProfileHeader,
} from "../components/common/ProfileOverview";
import PageState from "../components/common/PageState";
export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => userService.getPublicProfile(username!),
    select: (r) => r.data,
    enabled: !!username,
  });
  const status = (error as { response?: { status: number } })?.response?.status;
  return (
    <div className="page-wrap">
      {isLoading ? (
        <PageState loading />
      ) : error || !profile ? (
        <PageState
          title={
            status === 403
              ? "This profile is private"
              : status === 404
                ? "Profile not found"
                : "Profile unavailable"
          }
          description={
            status === 403
              ? "This member has chosen to keep their profile private."
              : status === 404
                ? "Check the username and try again."
                : "We could not load this profile. Please try again."
          }
          retry={status === 403 || status === 404 ? undefined : () => refetch()}
        />
      ) : (
        <>
          <span className="eyebrow">Meet the community</span>
          <ProfileHeader profile={profile} />
          <div className="section-title">
            <h2>Skills and recent solves</h2>
          </div>
          <ProfileOverview profile={profile} />
        </>
      )}
    </div>
  );
}
