import { Appearance } from '@clerk/types';

export const getClerkTheme = (): Appearance => {
  return {
    cssLayerName: 'clerk',
    baseTheme: undefined,
    variables: {
      // Use CSS custom properties that will be updated by our theme provider
      colorPrimary: 'hsl(var(--primary))',
      colorBackground: 'hsl(var(--background))',
      colorText: 'hsl(var(--foreground))',
      colorTextSecondary: 'hsl(var(--muted-foreground))',
      colorInputBackground: 'hsl(var(--background))',
      colorInputText: 'hsl(var(--foreground))',
      colorNeutral: 'hsl(var(--muted))',
      colorDanger: 'hsl(var(--destructive))',
      colorSuccess: 'hsl(142 76% 36%)', // green-600
      colorWarning: 'hsl(38 92% 50%)', // yellow-500
      borderRadius: '0.5rem',
      fontFamily: 'inherit',
      fontSize: '0.875rem',
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacingUnit: '1rem',
    },
    elements: {
      // Root container
      rootBox: 'bg-background text-foreground border-1 rounded-lg',
      
      // Modal/Form container
      card: 'bg-card text-card-foreground border-border shadow-lg rounded-lg',
      modalContent: 'bg-background text-foreground border-border shadow-lg',
      
      // Headers
      headerTitle: 'text-foreground font-semibold text-xl',
      headerSubtitle: 'text-muted-foreground text-sm',
      
      // Buttons
      socialButtonsBlockButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border transition-colors duration-200 p-2',
      formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200',
      formButtonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200',
      
      // Form elements
      formFieldInput: 'bg-background text-foreground border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200',
      formFieldLabel: 'text-foreground font-medium text-sm',
      formFieldSuccessText: 'text-green-600 text-sm',
      formFieldErrorText: 'text-red-600 text-sm',
      formFieldWarningText: 'text-yellow-600 text-sm',
      
      // Links
      footerActionLink: 'text-primary hover:text-primary/80 transition-colors duration-200',
      formResendCodeLink: 'text-primary hover:text-primary/80 transition-colors duration-200',
      
      // Text elements
      identityPreviewText: 'text-foreground',
      alertText: 'text-foreground',
      
      // User button
      userButtonAvatarBox: 'w-8 h-8',
      userButtonPopoverCard: 'bg-card text-card-foreground border-border shadow-lg',
      userButtonPopoverActionButton: 'text-foreground hover:bg-muted transition-colors duration-200',
      userButtonPopoverActionButtonText: 'text-foreground',
      userButtonPopoverFooter: 'text-muted-foreground text-xs',
    },
  };
};
