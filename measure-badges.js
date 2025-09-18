// Script de mesure des badges de réassurance sur l'application réelle
// À exécuter dans la console du navigateur sur http://localhost:3000

(function() {
    console.log('🔍 ANALYSE DES BADGES DE RÉASSURANCE - MBAYE TRANSPORT');
    console.log('='.repeat(60));

    // Fonction pour analyser un conteneur de badges
    function analyzeBadgesContainer() {
        // Sélectionner le conteneur des badges
        const badgesContainer = document.querySelector('.flex.flex-wrap.justify-center.items-center.gap-3.mb-12.px-4');

        if (!badgesContainer) {
            console.error('❌ Conteneur de badges non trouvé');
            return null;
        }

        console.log('✅ Conteneur de badges trouvé');

        // Analyser le conteneur
        const containerRect = badgesContainer.getBoundingClientRect();
        console.log('📏 Dimensions du conteneur:', {
            width: containerRect.width + 'px',
            height: containerRect.height + 'px',
            left: containerRect.left + 'px',
            top: containerRect.top + 'px'
        });

        // Analyser chaque badge
        const badges = badgesContainer.children;
        console.log(`📍 Nombre de badges trouvés: ${badges.length}`);

        const badgeAnalysis = [];

        for (let i = 0; i < badges.length; i++) {
            const badge = badges[i];
            const rect = badge.getBoundingClientRect();
            const text = badge.querySelector('span')?.textContent?.trim() || 'Texte non trouvé';
            const svg = badge.querySelector('svg');

            const analysis = {
                index: i + 1,
                text: text,
                dimensions: {
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    area: Math.round(rect.width * rect.height)
                },
                position: {
                    left: Math.round(rect.left),
                    top: Math.round(rect.top)
                },
                touchTarget: {
                    isValid: rect.width >= 44 && rect.height >= 44,
                    minDimension: Math.min(rect.width, rect.height),
                    recommendation: Math.min(rect.width, rect.height) >= 44 ? '✅ Valide' : '⚠️ Améliorer'
                },
                styles: {
                    backgroundColor: window.getComputedStyle(badge).backgroundColor,
                    padding: window.getComputedStyle(badge).padding,
                    borderRadius: window.getComputedStyle(badge).borderRadius,
                    fontSize: window.getComputedStyle(badge.querySelector('span')).fontSize
                },
                svgPresent: !!svg,
                svgColor: svg ? window.getComputedStyle(svg).color : 'N/A'
            };

            badgeAnalysis.push(analysis);

            console.log(`📱 Badge ${i + 1}: "${text}"`);
            console.log(`   Dimensions: ${analysis.dimensions.width}x${analysis.dimensions.height}px`);
            console.log(`   Touch target: ${analysis.touchTarget.recommendation}`);
            console.log(`   Position: (${analysis.position.left}, ${analysis.position.top})`);
        }

        return {
            container: {
                dimensions: containerRect,
                badgeCount: badges.length
            },
            badges: badgeAnalysis
        };
    }

    // Fonction pour tester différentes tailles d'écran
    function testResponsiveBreakpoints() {
        console.log('\n📱 TESTS RESPONSIVE');
        console.log('-'.repeat(40));

        const breakpoints = [
            { name: 'iPhone SE', width: 375, height: 667 },
            { name: 'iPhone 12/13', width: 390, height: 844 },
            { name: 'Android Standard', width: 360, height: 640 },
            { name: 'Tablet Portrait', width: 768, height: 1024 }
        ];

        const currentViewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        console.log(`Viewport actuel: ${currentViewport.width}x${currentViewport.height}px`);

        // Déterminer le breakpoint actuel
        let currentBreakpoint = 'Desktop';
        for (const bp of breakpoints) {
            if (currentViewport.width <= bp.width) {
                currentBreakpoint = bp.name;
                break;
            }
        }

        console.log(`📱 Breakpoint détecté: ${currentBreakpoint}`);

        return {
            current: currentBreakpoint,
            viewport: currentViewport,
            breakpoints: breakpoints
        };
    }

    // Fonction pour analyser la disposition des badges
    function analyzeBadgeLayout(badgesData) {
        console.log('\n📐 ANALYSE DE LA DISPOSITION');
        console.log('-'.repeat(40));

        if (!badgesData || !badgesData.badges) {
            console.error('❌ Données de badges manquantes');
            return null;
        }

        const badges = badgesData.badges;
        const containerWidth = badgesData.container.dimensions.width;

        // Calculer les lignes
        let lines = [[]];
        let currentLineY = badges[0]?.position.top;

        badges.forEach(badge => {
            if (Math.abs(badge.position.top - currentLineY) > 5) {
                // Nouvelle ligne détectée
                lines.push([]);
                currentLineY = badge.position.top;
            }
            lines[lines.length - 1].push(badge);
        });

        console.log(`📏 Nombre de lignes: ${lines.length}`);

        lines.forEach((line, index) => {
            const badgeTexts = line.map(b => b.text).join(', ');
            console.log(`   Ligne ${index + 1}: ${line.length} badge(s) - [${badgeTexts}]`);
        });

        // Analyser l'espacement
        if (badges.length > 1) {
            const gaps = [];
            for (let i = 1; i < badges.length; i++) {
                const gap = badges[i].position.left - (badges[i-1].position.left + badges[i-1].dimensions.width);
                if (gap > 0) gaps.push(gap);
            }

            if (gaps.length > 0) {
                const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
                console.log(`📐 Espacement moyen entre badges: ${Math.round(avgGap)}px`);
            }
        }

        return {
            lineCount: lines.length,
            lines: lines,
            isOptimal: lines.length <= 2
        };
    }

    // Fonction pour tester la performance
    function testPerformance() {
        console.log('\n⚡ TEST DE PERFORMANCE');
        console.log('-'.repeat(40));

        // Test backdrop-filter
        const badge = document.querySelector('.backdrop-blur-sm');
        const backdropSupported = badge && (
            window.getComputedStyle(badge).backdropFilter !== 'none' ||
            window.getComputedStyle(badge).webkitBackdropFilter !== 'none'
        );

        console.log(`🎨 Backdrop-filter supporté: ${backdropSupported ? '✅ Oui' : '❌ Non'}`);

        // Test de temps de rendu
        const startTime = performance.now();
        const badges = document.querySelectorAll('.flex.items-center.gap-2.bg-white\\/90');
        const endTime = performance.now();

        console.log(`⏱️ Temps de sélection des badges: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`🔢 Badges trouvés: ${badges.length}`);

        // Test SVG
        const svgs = document.querySelectorAll('.flex.items-center.gap-2.bg-white\\/90 svg');
        console.log(`🎨 SVG trouvés: ${svgs.length}`);

        return {
            backdropFilterSupported: backdropSupported,
            renderTime: endTime - startTime,
            badgeCount: badges.length,
            svgCount: svgs.length
        };
    }

    // Fonction pour générer le rapport complet
    function generateReport() {
        console.log('\n📊 GÉNÉRATION DU RAPPORT COMPLET');
        console.log('='.repeat(60));

        const badgesData = analyzeBadgesContainer();
        const responsiveData = testResponsiveBreakpoints();
        const layoutData = analyzeBadgeLayout(badgesData);
        const performanceData = testPerformance();

        if (!badgesData) {
            console.error('❌ Impossible de générer le rapport - badges non trouvés');
            return null;
        }

        console.log('\n🎯 RÉSUMÉ EXÉCUTIF');
        console.log('-'.repeat(30));

        const allTouchTargetsValid = badgesData.badges.every(b => b.touchTarget.isValid);
        console.log(`👆 Touch targets: ${allTouchTargetsValid ? '✅ Tous valides' : '⚠️ Certains trop petits'}`);

        console.log(`📱 Disposition: ${layoutData.isOptimal ? '✅ Optimale' : '⚠️ Améliorer'} (${layoutData.lineCount} ligne(s))`);
        console.log(`⚡ Performance: ${performanceData.renderTime < 5 ? '✅ Excellente' : '⚠️ Acceptable'}`);
        console.log(`🎨 Rendu: ${performanceData.backdropFilterSupported ? '✅ Moderne' : '⚠️ Fallback requis'}`);

        // Validation finale
        const isReadyForMobile = allTouchTargetsValid && layoutData.isOptimal && performanceData.renderTime < 10;

        console.log('\n🏁 VALIDATION FINALE');
        console.log('-'.repeat(30));
        console.log(`${isReadyForMobile ? '✅ READY FOR MOBILE' : '⚠️ NEEDS IMPROVEMENTS'}`);

        if (!isReadyForMobile) {
            console.log('\n🔧 RECOMMANDATIONS:');
            if (!allTouchTargetsValid) {
                console.log('  • Augmenter la taille des badges pour atteindre 44px minimum');
            }
            if (!layoutData.isOptimal) {
                console.log('  • Optimiser la disposition pour réduire le nombre de lignes');
            }
            if (performanceData.renderTime >= 10) {
                console.log('  • Optimiser les performances de rendu');
            }
        }

        return {
            badges: badgesData,
            responsive: responsiveData,
            layout: layoutData,
            performance: performanceData,
            isReadyForMobile: isReadyForMobile
        };
    }

    // Exécution du script
    const report = generateReport();

    // Stocker le rapport dans une variable globale pour inspection
    window.badgeAnalysisReport = report;

    console.log('\n💡 Pour réexécuter l\'analyse, tapez: badgeAnalysisReport');
    console.log('💡 Pour voir les données complètes, tapez: console.table(badgeAnalysisReport.badges.badges)');

    return report;
})();