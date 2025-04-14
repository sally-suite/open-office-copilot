import React, { useState } from "react";
import api from "@api/email";

interface Recipient {
  displayName: string;
  emailAddress: string;
}

const EmailApiTest: React.FC = () => {
  // State for input values
  const [insertText, setInsertText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyType, setBodyType] = useState<"text" | "html">("text");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [insertTextType, setInsertTextType] = useState<"text" | "html">("text");
  const [apiResponse, setApiResponse] = useState<string>("");

  // Function to handle API calls and display results
  const handleApiCall = async (
    apiFunction: () => Promise<any>,
    successMessage: string
  ) => {
    try {
      setApiResponse("Processing...");
      const result = await apiFunction();
      setApiResponse(
        `Success: ${successMessage}${
          result !== undefined ? ` Result: ${JSON.stringify(result)}` : ""
        }`
      );
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Function to add a recipient to the list
  const addRecipient = () => {
    if (recipientName && recipientEmail) {
      const newRecipient: Recipient = {
        displayName: recipientName,
        emailAddress: recipientEmail,
      };
      setRecipients([...recipients, newRecipient]);
      setRecipientName("");
      setRecipientEmail("");
    }
  };

  // Function to remove a recipient from the list
  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Email API Test</h1>

      <div className="bg-gray-100 p-4 mb-6 rounded">
        <h2 className="text-lg font-semibold mb-2">API Response:</h2>
        <pre className="bg-white p-3 rounded border">{apiResponse || "No response yet"}</pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insert Text */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Insert Text</h2>
          <div className="mb-2">
            <label className="block mb-1">Text to Insert:</label>
            <textarea
              className="w-full border rounded p-2"
              value={insertText}
              onChange={(e) => setInsertText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Type:</label>
            <select
              className="border rounded p-2"
              value={insertTextType}
              onChange={(e) => setInsertTextType(e.target.value as "text" | "html")}
            >
              <option value="text">Text</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              handleApiCall(
                () => api.insertText(insertText, insertTextType === "html" ? { type: "html" } : undefined),
                "Text inserted."
              )
            }
          >
            Insert Text
          </button>
        </div>

        {/* Get Selected Text */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Get Selected Text</h2>
          <div className="mb-2">
            <label className="block mb-1">Selected Text:</label>
            <textarea
              className="w-full border rounded p-2"
              value={selectedText}
              readOnly
              rows={3}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              handleApiCall(async () => {
                const text = await api.getSelectedText();
                setSelectedText(text);
                return text;
              }, "Selected text retrieved.")
            }
          >
            Get Selected Text
          </button>
        </div>

        {/* Get Document Content */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Get Document Content</h2>
          <div className="mb-2">
            <label className="block mb-1">Document Content:</label>
            <textarea
              className="w-full border rounded p-2"
              value={documentContent}
              readOnly
              rows={3}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              handleApiCall(async () => {
                const content = await api.getDocumentContent();
                setDocumentContent(content);
                return content;
              }, "Document content retrieved.")
            }
          >
            Get Document Content
          </button>
        </div>

        {/* Deselect */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Deselect</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              handleApiCall(() => {
                api.deselect();
                return undefined;
              }, "Selection cleared.")
            }
          >
            Deselect
          </button>
        </div>

        {/* Set Subject */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Set Subject</h2>
          <div className="mb-2">
            <label className="block mb-1">Subject:</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              handleApiCall(() => api.setSubject(subject), "Subject set.")
            }
          >
            Set Subject
          </button>
        </div>

        {/* Set Body */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Set Body</h2>
          <div className="mb-2">
            <label className="block mb-1">Body Text:</label>
            <textarea
              className="w-full border rounded p-2"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={3}
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Type:</label>
            <select
              className="border rounded p-2"
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value as "text" | "html")}
            >
              <option value="text">Text</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              handleApiCall(
                () => api.setBody(bodyText, bodyType),
                "Body set."
              )
            }
          >
            Set Body
          </button>
        </div>

        {/* Recipients Management */}
        <div className="border p-4 rounded col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Manage Recipients</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">Display Name:</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">Email Address:</label>
              <input
                type="email"
                className="w-full border rounded p-2"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
          
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
            onClick={addRecipient}
          >
            Add Recipient
          </button>
          
          {recipients.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Current Recipients:</h3>
              <ul className="bg-white border rounded p-2">
                {recipients.map((recipient, index) => (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span>
                      {recipient.displayName} ({recipient.emailAddress})
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeRecipient(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() =>
                handleApiCall(
                  () => api.setToRecipients(recipients),
                  "TO recipients set."
                )
              }
            >
              Set TO Recipients
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() =>
                handleApiCall(
                  () => api.setCCRecipients(recipients),
                  "CC recipients set."
                )
              }
            >
              Set CC Recipients
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() =>
                handleApiCall(
                  () => api.setBCCRecipients(recipients),
                  "BCC recipients set."
                )
              }
            >
              Set BCC Recipients
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailApiTest;
