import { useState } from 'react';
import { Button, FieldError, Form, Input, Label, TextField } from "react-aria-components";

function LoginForm({ onLoggedIn }) {
    const [password, setPassword] = useState("");
    const [serverError, setServerError] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError(null);

        let response;
        try {
            response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
        } catch {
            setServerError("Couldn't reach the server. Try again in a moment.");
            return;
        }

        if (response.ok) {
            setPassword("");
            onLoggedIn();
        } else {
            const data = await response.json();
            setServerError(data.error);
        }
    }

    return (
        <section className="panel" aria-labelledby="login-heading">
            <h2 id="login-heading">Log in to add or delete sites</h2>

            <Form
                onSubmit={handleSubmit}
                validationErrors={serverError ? { password: serverError } : {}}
                className="add-form"
            >
                <TextField
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    isRequired
                    value={password}
                    onChange={setPassword}
                    className="field"
                >
                    <Label>Admin password</Label>
                    <Input />
                    <FieldError className="field-error" />
                </TextField>

                <Button type="submit" className="button button--primary">Log in</Button>
            </Form>
        </section>
    );
}

export default LoginForm;

