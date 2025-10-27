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
  
  // Handle loading state instead of throwing
  if (!config) {
    return <Loader />;
  }

  const schema = useMemo(() => getSchemaByName(config.object, decodeURIComponent(params.name)), [config, params.name]);
  
  // Handle missing schema with error UI instead of throwing
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