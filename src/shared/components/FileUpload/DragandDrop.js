import React, { useState, useEffect } from "react";
import styled from "styled-components";

const DragAndDrop = ({ handleDrop: externalDrop, children }) => {
    const [drag, setDrag] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(dragCounter + 1);
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDrag(true);
        }
    };
    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(dragCounter - 1);
        if (dragCounter - 1 === 0) {
            setDrag(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDrag(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            externalDrop([...e.dataTransfer.files]);
            e.dataTransfer.clearData();
            setDragCounter(0);
        }
    };
    useEffect(() => {
        var div = document.getElementById("draganddrop-wrapper");
        div.addEventListener("dragenter", handleDragIn);
        div.addEventListener("dragleave", handleDragOut);
        div.addEventListener("dragover", handleDrag);
        div.addEventListener("drop", handleDrop);
        return () => {
            div.removeEventListener("dragenter", handleDragIn);
            div.removeEventListener("dragleave", handleDragOut);
            div.removeEventListener("dragover", handleDrag);
            div.removeEventListener("drop", handleDrop);
        };
    }, []);
    return (
        <Wrapper id="draganddrop-wrapper">
            {drag && (
                <div className="drag-hover">
                    <div className="drag-overlay">
                        <div>drop here</div>
                    </div>
                </div>
            )}
            {children}
        </Wrapper>
    );
};
const Wrapper = styled.div`
    display: inline-block;
    position: relative;

    .drag-hover {
        border: dashed grey 4px;
        background: rgba(255, 255, 255, 0.8);
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        
        .drag-overlay {
            position: absolute;
            top: 50%;
            right: 0;
            left: 0;
            text-align: center;
            color: grey;
            font-size: 36px;
        }
    }
`;
export default DragAndDrop;