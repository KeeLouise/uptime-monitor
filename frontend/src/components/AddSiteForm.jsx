import { useState, useEffect, useRef } from "react";
import { Button, FieldError, Form, Input, Label, Text, TextField } from "react-aria-components"

function AddSiteForm({ onAdded, focusOnMount }) {
    const [url, setUrl] = useState("");
    const [serverError, setServerError] = useState(null);
    const [message, setMessage] = useState("");
    const headingRef = useRef(null);

    useEffect(() => {
        if (focusOnMount && headingRef.current) {
            headingRef.current.focus();
        }
    }, [focusOnMount]);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setServerError(null);

        let response;
        try {
            response = await fetch("/api/sites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
        } catch {
            setServerError("Couldn't reach the server. Try again in a moment.")
            return
        }

        if (response.ok) {
            setMessage(`Added ${url}`)
            setUrl("");
            onAdded();
        } else {
            const data = await response.json()
            setServerError(data.error)
        }
    }

    return (
        <section className="panel" aria-labelledby="add-heading">
            <h2 id="add-heading" ref={headingRef} tabIndex={-1}>
                Add a site
            </h2>

            <Form
                onSubmit={handleSubmit}
                validationErrors={serverError ? { url: serverError } : {}}
                className="add-form"
            >
                <TextField name="url" type="url" isRequired value={url} onChange={setUrl} className="field">
                    <Label>Website address</Label>
                    <Text slot="description" className="hint">
                        Start with https://, for example https://example.com
                    </Text>
                    <Input />
                    <FieldError className="field-error" />
                </TextField>

                <Button type="submit" className="button button--primary">Add site</Button>
            </Form>
            <p role="status" className="form-success">{message}</p>
        </section>
    );
}

export default AddSiteForm;