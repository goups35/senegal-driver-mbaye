// Script Node.js pour capturer des screenshots des tests mobile
// Nécessite Playwright: npm install playwright

const { chromium } = require('playwright');

async function captureMobileTests() {
    console.log('🔍 Démarrage des captures mobile - Badges Mbaye Transport');

    const browser = await chromium.launch();
    const context = await browser.newContext();

    // Configurations de test mobile
    const mobileConfigs = [
        {
            name: 'iPhone_SE',
            viewport: { width: 375, height: 667 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        },
        {
            name: 'iPhone_12',
            viewport: { width: 390, height: 844 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        },
        {
            name: 'Android_Standard',
            viewport: { width: 360, height: 640 },
            userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        },
        {
            name: 'Tablet_Portrait',
            viewport: { width: 768, height: 1024 },
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
    ];

    for (const config of mobileConfigs) {
        console.log(`📱 Test ${config.name} - ${config.viewport.width}x${config.viewport.height}`);

        const page = await context.newPage();
        await page.setViewportSize(config.viewport);
        await page.setUserAgent(config.userAgent);

        try {
            // Aller sur la page principale
            await page.goto('http://localhost:3000', {
                waitUntil: 'networkidle',
                timeout: 10000
            });

            // Attendre que les badges soient chargés
            await page.waitForSelector('.flex.flex-wrap.justify-center.items-center.gap-3', {
                timeout: 5000
            });

            // Script d'analyse des badges dans le navigateur
            const badgeAnalysis = await page.evaluate(() => {
                const container = document.querySelector('.flex.flex-wrap.justify-center.items-center.gap-3.mb-12.px-4');
                if (!container) return { error: 'Container not found' };

                const badges = Array.from(container.children);
                const containerRect = container.getBoundingClientRect();

                return {
                    container: {
                        width: Math.round(containerRect.width),
                        height: Math.round(containerRect.height),
                        top: Math.round(containerRect.top),
                        left: Math.round(containerRect.left)
                    },
                    badges: badges.map((badge, index) => {
                        const rect = badge.getBoundingClientRect();
                        const text = badge.querySelector('span')?.textContent?.trim() || '';
                        const svg = badge.querySelector('svg');

                        return {
                            index: index + 1,
                            text: text,
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            top: Math.round(rect.top),
                            left: Math.round(rect.left),
                            touchTargetValid: rect.width >= 44 && rect.height >= 44,
                            hasIcon: !!svg
                        };
                    }),
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                };
            });

            console.log(`   📊 Analyse:`, badgeAnalysis);

            // Capture d'écran
            await page.screenshot({
                path: `./mobile-test-${config.name}.png`,
                fullPage: false
            });

            // Capture d'écran avec badges highlighted
            await page.addStyleTag({
                content: `
                    .flex.flex-wrap.justify-center.items-center.gap-3.mb-12.px-4 > div {
                        outline: 2px solid red !important;
                        position: relative !important;
                    }
                    .flex.flex-wrap.justify-center.items-center.gap-3.mb-12.px-4 > div::after {
                        content: attr(data-size) !important;
                        position: absolute !important;
                        top: -20px !important;
                        left: 0 !important;
                        background: red !important;
                        color: white !important;
                        padding: 2px 4px !important;
                        font-size: 10px !important;
                        border-radius: 2px !important;
                    }
                `
            });

            // Ajouter les dimensions aux badges
            await page.evaluate(() => {
                const badges = document.querySelectorAll('.flex.flex-wrap.justify-center.items-center.gap-3.mb-12.px-4 > div');
                badges.forEach(badge => {
                    const rect = badge.getBoundingClientRect();
                    badge.setAttribute('data-size', `${Math.round(rect.width)}x${Math.round(rect.height)}`);
                });
            });

            await page.screenshot({
                path: `./mobile-test-${config.name}-highlighted.png`,
                fullPage: false
            });

            console.log(`   ✅ Captures sauvées: mobile-test-${config.name}.png`);

        } catch (error) {
            console.error(`   ❌ Erreur ${config.name}:`, error.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('🎉 Captures terminées');
}

// Auto-exécution si le script est lancé directement
if (require.main === module) {
    captureMobileTests().catch(console.error);
}

module.exports = { captureMobileTests };