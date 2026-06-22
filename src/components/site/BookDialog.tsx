'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MessageCircle, Mail, Loader2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inquirySchema, type InquiryFormData } from '@/lib/schemas';
import { buildWhatsAppLink, buildMailtoLink } from '@/lib/contact';
import { z } from 'zod';

// zodResolver needs @hookform/resolvers — inline resolution for compatibility
function zodResolverCompat(schema: z.ZodTypeAny) {
  return async (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (path) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    });
    return { values: {}, errors };
  };
}

const PROJECT_TYPES = [
  'Business Website',
  'E-commerce Store',
  'Landing Page',
  'Portfolio Site',
  'Web Application',
  'Website Redesign',
  'Other',
];

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillProjectType?: string;
}

type Step = 'form' | 'channel';

export function BookDialog({ open, onOpenChange, prefillProjectType }: BookDialogProps) {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<InquiryFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolverCompat(inquirySchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      project_type: prefillProjectType || '',
      message: '',
      website: '',
    },
  });

  const projectTypeValue = watch('project_type');

  const onSubmit = async (data: InquiryFormData) => {
    setFormData(data);
    setStep('channel');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      reset();
      setStep('form');
      setFormData(null);
    }
    onOpenChange(open);
  };

  const submitAndNavigate = async (channel: 'whatsapp' | 'email') => {
    if (!formData || isSubmitting) return;
    setIsSubmitting(true);

    // Fire-and-forget inquiry to API
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // Silently continue — don't block the user
    }

    // Build pre-filled message
    const msgParts = [
      `Hi Aniekan, I'm ${formData.name}.`,
      `I'd like a ${formData.project_type} website.`,
      formData.message ? formData.message : '',
      '(Sent from swiftcreator.com)',
    ]
      .filter(Boolean)
      .join(' ');

    handleClose(false);
    setIsSubmitting(false);

    if (channel === 'whatsapp') {
      window.open(buildWhatsAppLink(msgParts), '_blank', 'noopener,noreferrer');
    } else {
      const subject = `Website Inquiry — ${formData.project_type}`;
      window.location.href = buildMailtoLink(subject, msgParts);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Start your project</DialogTitle>
              <DialogDescription>
                Tell me a little about what you need — it takes 60 seconds.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Honeypot - hidden from humans */}
              <input
                type="text"
                tabIndex={-1}
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                {...register('website')}
              />

              {/* Name */}
              <div>
                <Label htmlFor="name">Your name *</Label>
                <Input
                  id="name"
                  placeholder="Afolabi Chukwuemeka"
                  autoComplete="name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">WhatsApp / Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  autoComplete="tel"
                  {...register('phone')}
                />
              </div>

              {/* Project type */}
              <div>
                <Label htmlFor="project_type">Project type *</Label>
                <Select
                  value={projectTypeValue}
                  onValueChange={(val) => setValue('project_type', val)}
                >
                  <SelectTrigger id="project_type">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_type && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.project_type.message}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Anything else? (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Budget, timeline, specific requirements..."
                  rows={3}
                  {...register('message')}
                />
              </div>

              <Button type="submit" size="lg" className="w-full text-sm tracking-widest uppercase">
                Continue
              </Button>
            </form>
          </>
        )}

        {step === 'channel' && formData && (
          <>
            <DialogHeader>
              <DialogTitle>How would you like to connect?</DialogTitle>
              <DialogDescription>
                Choose your preferred way to continue the conversation with Aniekan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <button
                onClick={() => submitAndNavigate('whatsapp')}
                disabled={isSubmitting}
                className="w-full flex items-center gap-4 p-5 border border-[var(--line)] rounded-sm bg-[var(--bg)] hover:border-green-600 hover:bg-green-950/20 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-800/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-[var(--ink)] group-hover:text-green-300 transition-colors">
                    Continue on WhatsApp
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Fastest response — usually within hours
                  </p>
                </div>
              </button>

              <button
                onClick={() => submitAndNavigate('email')}
                disabled={isSubmitting}
                className="w-full flex items-center gap-4 p-5 border border-[var(--line)] rounded-sm bg-[var(--bg)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--gold)] transition-colors">
                    Continue by Email
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Opens your email client with message pre-filled
                  </p>
                </div>
              </button>

              {isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)] py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending your message...</span>
                </div>
              )}

              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go back and edit
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
