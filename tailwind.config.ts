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
				'poppins': ['Poppins', 'sans-serif'],
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
					'0%, 100%': {
						transform: 'translateY(0px) scale(1)',
						opacity: '0.7'
					},
					'50%': {
						transform: 'translateY(-20px) scale(1.05)',
						opacity: '1'
					}
				},
				'shimmer': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateX(0%)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateX(100%)',
						opacity: '0'
					}
				},
				'charge-pulse': {
					'0%, 100%': {
						transform: 'rotate(12deg) scale(1)',
						opacity: '0.8'
					},
					'50%': {
						transform: 'rotate(15deg) scale(1.1)',
						opacity: '1',
						boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
					}
				},
				'battery-charge': {
					'0%': {
						transform: 'rotate(-12deg) scale(1)',
						opacity: '0.8'
					},
					'50%': {
						transform: 'rotate(-15deg) scale(1.05)',
						opacity: '1',
						boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
					},
					'100%': {
						transform: 'rotate(-12deg) scale(1)',
						opacity: '0.8'
					}
				},
				'spark': {
					'0%, 100%': {
						transform: 'scale(1) rotate(0deg)',
						opacity: '0.6'
					},
					'50%': {
						transform: 'scale(1.3) rotate(180deg)',
						opacity: '1'
					}
				},
				'power-flow': {
					'0%': {
						transform: 'translateX(-100%) scaleX(0)',
						opacity: '0'
					},
					'50%': {
						transform: 'translateX(0%) scaleX(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateX(100%) scaleX(0)',
						opacity: '0'
					}
				},
				'float-rotate': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg) scale(1)'
					},
					'33%': {
						transform: 'translateY(-15px) rotate(120deg) scale(1.1)'
					},
					'66%': {
						transform: 'translateY(-10px) rotate(240deg) scale(0.9)'
					}
				},
				'energy-flow': {
					'0%, 100%': {
						transform: 'scaleX(0.3)',
						opacity: '0.4'
					},
					'50%': {
						transform: 'scaleX(1)',
						opacity: '1'
					}
				},
				'energy-orb': {
					'0%, 100%': {
						transform: 'scale(1) rotate(0deg)',
						opacity: '0.6'
					},
					'50%': {
						transform: 'scale(1.2) rotate(180deg)',
						opacity: '0.9'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
