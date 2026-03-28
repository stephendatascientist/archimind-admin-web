"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, HelpCircle, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClarificationInput } from "@/lib/types/api";

interface ClarificationCarouselProps {
    inputs: ClarificationInput[];
    onSubmit: (answers: Record<string, { selected_index: number | null; custom_answer: string | null }>) => void;
    isLoading?: boolean;
}

export function ClarificationCarousel({ inputs, onSubmit, isLoading }: ClarificationCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, { selected_index: number | null; custom_answer: string | null }>>(
        inputs.reduce((acc, input) => ({
            ...acc,
            [input.id]: {
                selected_index: input.selected_index,
                custom_answer: input.custom_answer,
            },
        }), {})
    );

    const currentInput = inputs[currentIndex];
    const currentAnswer = answers[currentInput.id];

    const handleSelectOption = (index: number) => {
        setAnswers((prev) => ({
            ...prev,
            [currentInput.id]: {
                selected_index: index,
                custom_answer: null,
            },
        }));
    };

    const handleCustomAnswerChange = (value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentInput.id]: {
                selected_index: null,
                custom_answer: value || null,
            },
        }));
    };

    const isCurrentInputAnswered =
        currentAnswer.selected_index !== null ||
        (currentAnswer.custom_answer !== null && currentAnswer.custom_answer.trim() !== "");

    const allAnswered = inputs.every((input) => {
        const answer = answers[input.id];
        return answer.selected_index !== null || (answer.custom_answer !== null && answer.custom_answer.trim() !== "");
    });

    const next = () => {
        if (currentIndex < inputs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = () => {
        if (allAnswered) {
            onSubmit(answers);
        }
    };

    return (
        <Card className="border-border bg-card shadow-sm overflow-hidden rounded-xl">
            <CardHeader className="pb-3 space-y-1 bg-muted/30 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <HelpCircle className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Clarification Needed
                            </CardTitle>
                            <span className="text-[11px] text-muted-foreground">
                                The agent needs more details to proceed
                            </span>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold bg-background">
                        {currentIndex + 1} / {inputs.length}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold leading-tight text-foreground px-1">
                        {currentInput.question}
                    </h3>

                    <div className="grid gap-2.5">
                        {currentInput.options.map((option, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className={cn(
                                    "justify-start h-auto py-3 px-4 text-left font-medium text-sm transition-all border-border shadow-sm",
                                    currentAnswer.selected_index === idx
                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                                        : "bg-background hover:bg-muted hover:border-border"
                                )}
                                onClick={() => handleSelectOption(idx)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={cn(
                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors",
                                        currentAnswer.selected_index === idx
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "bg-muted border-border text-muted-foreground"
                                    )}>
                                        {currentAnswer.selected_index === idx ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                                    </div>
                                    <span className="flex-1">{option}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                        <MessageSquare className="h-3 w-3" />
                        Custom Response
                    </div>
                    <Textarea
                        placeholder="Type your answer here..."
                        className="text-sm resize-none bg-background border-border min-h-[70px] focus:ring-primary/20"
                        value={currentAnswer.custom_answer || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentInput.id]: { ...prev[currentInput.id], custom_answer: e.target.value, selected_index: null } }))}
                    />
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border pt-4 bg-muted/10">
                <div className="flex gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={prev}
                        disabled={currentIndex === 0}
                        className="h-8 w-8 p-0 hover:bg-muted"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={next}
                        disabled={currentIndex === inputs.length - 1}
                        className="h-8 w-8 p-0 hover:bg-muted"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {currentIndex === inputs.length - 1 ? (
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!allAnswered || isLoading}
                        className="gap-2 px-5 h-9 font-semibold shadow-sm"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                Processing...
                            </span>
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                Submit Answers
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={next}
                        disabled={!isCurrentInputAnswered}
                        className="text-xs font-bold text-primary hover:bg-primary/5 px-3"
                    >
                        Next Question
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
