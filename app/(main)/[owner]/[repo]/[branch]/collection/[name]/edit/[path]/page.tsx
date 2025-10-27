"use client";

import { useMemo } from "react";
import { useConfig } from "@/contexts/config-context";
import { getSchemaByName } from "@/lib/schema";
import { EntryEditor } from "@/components/entry/entry-editor";
import { Message } from "@/components/message";
import { Loader } from "@/components/loader";

export default function Page({
  params
}: {
  params: {
    owner: string;
    repo: string;
    branch: string;
    name: string;
    path: string;
  }
}) {
  const { config } = useConfig();

  // Call useMemo unconditionally (hooks rule)
  const schema = useMemo(() => {
    if (!config) return null;
    return getSchemaByName(config.object, decodeURIComponent(params.name));
  }, [config, params.name]);
  
  // Handle loading state - render after all hooks
  if (!config) {
    return <Loader />;
  }
  
  // Handle missing schema with error UI
  if (!schema) {
    return (
      <Message
        title="Collection Not Found"
        description={`The collection "${decodeURIComponent(params.name)}" doesn't exist in your configuration.`}
        cta="Go Back"
        href={`/${params.owner}/${params.repo}/${params.branch}`}
      />
    );
  }
  
  return (
    <EntryEditor name={decodeURIComponent(params.name)} path={decodeURIComponent(params.path)}/>
  );
}