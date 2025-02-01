import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from "../button";
import { setUserPrivacyState } from "chat-list/service/users";
interface ICardPrivacyProps {
  onConfirm: () => void;
}
export default function CardPrivacy(props: ICardPrivacyProps) {
  const { onConfirm } = props;
  const [state, setState] = useState("");

  const onClickConfirm = async () => {
    setState("yes");
    await setUserPrivacyState("yes");
    onConfirm?.();
  };

  return (
    <Card className="w-card">
      <CardTitle>Privacy Policy</CardTitle>
      <CardContent className="  flex flex-col justify-center items-center overflow-hidden">
        <div className="markdown">
          Hello there! 🌟 We care about your privacy. Before we get started,
          please take a moment to read our{" "}
          <a
            href="https://www.sally.bot/legal/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          . It outlines how we protect your data and ensure your online
          experience is secure, including uploading your sheet data to OpenAI
          for processing. Click <code>Confirm</code> to show you&apos;ve
          reviewed and agree to our policies. Thanks for trusting us!
        </div>
      </CardContent>
      <CardActions>
        <Button action="translate-text" onClick={onClickConfirm}>
          {state === "yes" ? "Confirmed" : "Confirm"}
        </Button>
      </CardActions>
    </Card>
  );
}
