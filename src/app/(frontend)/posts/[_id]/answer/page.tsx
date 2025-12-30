import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PostService from "@/services/post.service";
import { notFound, redirect } from "next/navigation";
import { createAnswerAction } from "../../../actions/createAnswerAction";
// import your create-answer action, zod schema, etc.

export default async function AnswerPage({
  params,
}: {
  params: { _id: string }; // or _id depending on your folder name
}) {
    const props = await params;
  const { _id } = props;

  const session = await getServerSession(authOptions);
  if (!session?.user?._id) redirect("/auth/sign-in");

  const question = await PostService.fetchPostById(_id);
  if (!question || question.type !== "question") notFound();

  // render a form to create an answer
  // include hidden fields for type="answer" and questionId=id

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2">
        Answer: {question.title}
      </h1>

      <p className="text-sm text-gray-400 mb-6">
        Subject: {question.subject || "General"}
      </p>

      <form action={createAnswerAction}>
        <input type="hidden" name="type" value="answer" />
        <input type="hidden" name="questionId" value={_id} />

        <label className="block text-sm font-semibold text-teal-300 mb-3">
          Your Answer
        </label>
        <textarea
          name="content"
          rows={8}
          className="w-full px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 text-white"
          required
        />

        <div className="mt-6 flex gap-3">
          <a
            href={`/posts/${_id}`}
            className="px-4 py-2 rounded-xl bg-gray-700 text-gray-200"
          >
            Cancel
          </a>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-teal-600 text-white font-semibold"
          >
            Submit Answer
          </button>
        </div>
      </form>
    </div>
  );
}
