#!/usr/bin/env python3
"""
Generador de efectos CSS para mesa de ping pong profesional
Este script genera CSS adicional para efectos avanzados
"""

def generate_shadow_effects():
    """Genera efectos de sombra dinámicos"""
    shadows = []
    
    # Sombras múltiples para profundidad
    for i in range(5):
        opacity = 0.8 - (i * 0.15)
        blur = 10 + (i * 8)
        offset = 5 + (i * 3)
        shadows.append(f"0 {offset}px {blur}px rgba(0, 0, 0, {opacity})")
    
    return ", ".join(shadows)

def generate_metallic_gradient():
    """Genera gradiente metálico para bordes"""
    colors = [
        "#f0f0f0", "#e8e8e8", "#d8d8d8", "#c8c8c8", 
        "#b8b8b8", "#a8a8a8", "#989898", "#888888"
    ]
    
    gradient_stops = []
    for i, color in enumerate(colors):
        percentage = (i / (len(colors) - 1)) * 100
        gradient_stops.append(f"{color} {percentage}%")
    
    return f"linear-gradient(90deg, {', '.join(gradient_stops)})"

def generate_professional_css():
    """Genera CSS profesional completo"""
    
    css_template = f"""
/* ===== EFECTOS PROFESIONALES GENERADOS ===== */

/* Sombras dinámicas */
.table-professional-shadow {{
    box-shadow: {generate_shadow_effects()};
}}

/* Gradiente metálico */
.metallic-border {{
    background: {generate_metallic_gradient()};
}}

/* Efectos de brillo animados */
@keyframes professional-shine {{
    0% {{ 
        background-position: -200% 0; 
    }}
    100% {{ 
        background-position: 200% 0; 
    }}
}}

.shine-effect {{
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
    );
    background-size: 200% 100%;
    animation: professional-shine 3s ease-in-out infinite;
}}

/* Reflexiones realistas */
.realistic-reflection {{
    background: 
        radial-gradient(ellipse at 30% 20%, 
            rgba(255, 255, 255, 0.3) 0%, 
            transparent 50%
        ),
        radial-gradient(ellipse at 70% 80%, 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 40%
        );
}}
"""
    
    return css_template

def main():
    """Función principal"""
    print("🏓 Generador de Efectos CSS Profesionales")
    print("=" * 50)
    
    # Generar CSS
    professional_css = generate_professional_css()
    
    # Guardar en archivo
    with open("professional_effects.css", "w", encoding="utf-8") as f:
        f.write(professional_css)
    
    print("✅ Efectos CSS generados en 'professional_effects.css'")
    print("\n📋 Efectos incluidos:")
    print("- Sombras dinámicas multicapa")
    print("- Gradientes metálicos")
    print("- Animaciones de brillo")
    print("- Reflexiones realistas")
    
    # Mostrar estadísticas
    print(f"\n📊 Estadísticas:")
    print(f"- Líneas de CSS: {len(professional_css.split(chr(10)))}")
    print(f"- Efectos de sombra: 5 capas")
    print(f"- Colores metálicos: 8 tonos")

if __name__ == "__main__":
    main()