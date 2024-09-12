"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import React, { FC, useRef } from "react";
import { useRouter } from "next/navigation";

type ButtonActionProps = {
  id: string;
  userId: string;
};

const ButtonAction: FC<ButtonActionProps> = ({ id, userId }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDialogElement>(null);
  const { mutate: deletePost, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      return axios.delete(`/api/post/${id}`, { data: { userId } });
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const handleOpenModal = () => {
    modalRef.current?.showModal();
  };

  const handleDeletePost = () => {
    deletePost(userId);
    modalRef.current?.close();
  };

  return (
    <div>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn m-1">
          ...
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          <li>
            <Link href={`/edit/${id}`}>
              <Pen />
              編集
            </Link>
          </li>
          <li>
            <div onClick={handleOpenModal}>
              {isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Trash />
              )}
              削除
            </div>
          </li>
        </ul>
      </div>
      <ConfirmModal ref={modalRef} onDeletePost={handleDeletePost} />
    </div>
  );
};

type ConfirmModalProps = {
  onDeletePost: () => void;
};

const ConfirmModal = React.forwardRef<HTMLDialogElement, ConfirmModalProps>(
  ({ onDeletePost }, ref) => {
    return (
      <dialog ref={ref} id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">投稿を削除しますか？</p>
          <div className="modal-action">
            <button className="btn" onClick={onDeletePost}>
              削除
            </button>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">キャンセル</button>
            </form>
          </div>
        </div>
      </dialog>
    );
  }
);

ConfirmModal.displayName = "ConfirmModal";

export default ButtonAction;
