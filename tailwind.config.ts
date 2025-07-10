import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'proxima': ['Proxima Nova', 'Arial', 'sans-serif'],
				'sans': ['Proxima Nova', 'Arial', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				// Dating App Color Extensions
				love: {
					primary: 'hsl(var(--love-primary))',
					secondary: 'hsl(var(--warm-secondary))',
					success: 'hsl(var(--match-success))',
					like: 'hsl(var(--like-green))',
					nope: 'hsl(var(--nope-red))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'love': '0 4px 20px hsl(var(--love-primary) / 0.3)',
				'love-lg': '0 8px 30px hsl(var(--love-primary) / 0.4)',
				'card': 'var(--card-shadow)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
			},
			backdropBlur: {
				xs: '2px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-12px)' }
				},
				'pulse-heart': {
					'0%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(1.1)' },
					'50%': { transform: 'scale(1.05)' },
					'75%': { transform: 'scale(1.1)' },
					'100%': { transform: 'scale(1)' }
				},
				'swipe-like': {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(100px) rotate(15deg)', opacity: '0' }
				},
				'swipe-nope': {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(-100px) rotate(-15deg)', opacity: '0' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200px 0' },
					'100%': { backgroundPosition: 'calc(200px + 100%) 0' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-5px)' },
					'75%': { transform: 'translateX(5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-heart': 'pulse-heart 1.5s ease-in-out infinite',
				'swipe-like': 'swipe-like 0.6s ease-out forwards',
				'swipe-nope': 'swipe-nope 0.6s ease-out forwards',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'shimmer': 'shimmer 1.5s infinite',
				'shake': 'shake 0.5s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
