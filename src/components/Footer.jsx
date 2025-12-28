import { Shield, Twitter, Linkedin, Github, Mail } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        Product: ['Features', 'API Access', 'Pricing', 'Documentation'],
        Company: ['About Us', 'Our Mission', 'Careers', 'Press Kit'],
        Resources: ['Blog', 'Case Studies', 'Fact-Check Database', 'Partner Program'],
        Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Compliance']
    }

    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Mail, href: '#', label: 'Email' }
    ]

    return (
        <footer className="relative border-t border-[rgba(148,163,184,0.1)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer */}
                <div className="py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                VEDANTA
                            </span>
                        </div>
                        <p className="text-[#64748B] text-sm mb-6 max-w-xs">
                            AI-powered investigative journalism platform for accurate,
                            real-time news verification.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-lg bg-[#1A365D] flex items-center justify-center text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-colors"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold mb-4">{category}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-[#64748B] hover:text-[#0EA5E9] transition-colors text-sm"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-[rgba(148,163,184,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[#64748B] text-sm">
                        © {currentYear} VEDANTA. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-[#64748B] text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
