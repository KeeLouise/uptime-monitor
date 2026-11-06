import { useState } from "react";
import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";

function DeleteSiteButton({ site, onDeleted }) {
    const [error, setError] = useState(null);

    async function handleDelete(close) {
        setError(null)

        let response;
        try {
            response = await fetch(`/api/sites/${site.id}`, { method: "DELETE" });
        } catch {
            setError("Couldn't reach the server. Nothing was deleted.");
            return;
        }

        if (response.ok) {
            close()
            onDeleted(site.url)
        } else {
            const data = await response.json()
            setError(data.error)
        }
    }

    return (
        <DialogTrigger>
            <Button className="button button--danger">
                Delete<span className="sr-only"> {site.url}</span>
            </Button>

            <ModalOverlay className="modal-overlay">
                <Modal className="modal">
                    <Dialog role="alertdialog" className="dialog">
                        {({ close }) => (
                            <>
                                <Heading slot="title">Delete {site.url}?</Heading>
                                <p>Its check history will be deleted too. This can't be undone.</p>
                                {error && <p className="field-error" role="alert">{error}</p>}

                                <div className="dialog-actions">
                                    <Button className="button" onPress={close} autoFocus>
                                        Cancel
                                    </Button>
                                    <Button className="button button--danger-solid" onPress={() => handleDelete(close)}>
                                        Delete site
                                    </Button>
                                </div>
                            </>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );

};

export default DeleteSiteButton;