import { UsersIcon } from "lucide-react";
import { Link } from "react-router";

const NoFriends = () => {
  return (
    <div className="hero bg-base-200 rounded-2xl min-h-[400px]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="flex justify-center mb-5">
            <div className="bg-primary/10 p-6 rounded-full">
              <UsersIcon className="size-16 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-bold">No Friends Yet</h2>

          <p className="py-4 text-base-content/70">
            You haven't connected with anyone yet. Send friend requests and
            start chatting with language learners around the world.
          </p>

          <Link to="/" className="btn btn-primary">
            Find New Friends
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoFriends;
