"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImageUp, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadThing } from "@/lib/uploadthing";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

export function ImageUpload({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value?: string | null;
  onChange: (url: string) => void;
  label: string;
  icon: LucideIcon;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("entityImage", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) onChange(res[0].url);
    },
    onUploadError: (error) => {
      toast.error(error.message || "Image upload failed");
    },
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only PNG and JPG images are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 10 MB or smaller");
      return;
    }

    startUpload([file]);
  }

  return (
    <Card className="flex-row items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarImage src={value ?? undefined} />
          <AvatarFallback>
            <Icon className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">Upload {label} image</p>
          <p className="text-xs text-muted-foreground">
            formats allowed are *png, *jpg. up to 10 MB with a minimum size of 400px by 400px
          </p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" hidden onChange={handleFileChange} />
      <Button type="button" variant="outline" disabled={isUploading} onClick={() => inputRef.current?.click()}>
        <ImageUp />
        {isUploading ? "Uploading..." : "Upload image"}
      </Button>
    </Card>
  );
}
