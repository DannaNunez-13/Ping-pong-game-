using UnityEngine;
using System.Collections;

public class BackgroundAnimator : MonoBehaviour
{
    [Header("Camera Animation")]
    public Camera backgroundCamera;
    public float cameraMovementSpeed = 0.5f;
    public float cameraMovementAmplitude = 0.5f;
    public bool enableCameraRotation = true;
    public float cameraRotationSpeed = 2f;
    
    [Header("Table Animation")]
    public Transform pingPongTable;
    public float tableRotationSpeed = 10f;
    public bool enableTableFloat = true;
    public float tableFloatAmplitude = 0.2f;
    public float tableFloatSpeed = 1f;
    
    [Header("Lighting Animation")]
    public Light[] dynamicLights;
    public float lightIntensityVariation = 0.3f;
    public float lightColorChangeSpeed = 1f;
    public Color[] lightColors = { Color.cyan, Color.magenta, Color.yellow, Color.green };
    
    [Header("Particle Effects")]
    public ParticleSystem[] backgroundParticles;
    public bool enableParticleColorChange = true;
    
    [Header("Skybox Animation")]
    public Material skyboxMaterial;
    public float skyboxRotationSpeed = 0.5f;
    
    private Vector3 originalCameraPosition;
    private Vector3 originalTablePosition;
    private float[] originalLightIntensities;
    private Color[] originalLightColors;
    
    void Start()
    {
        InitializeOriginalValues();
        StartBackgroundAnimations();
    }
    
    void InitializeOriginalValues()
    {
        if (backgroundCamera != null)
            originalCameraPosition = backgroundCamera.transform.position;
        
        if (pingPongTable != null)
            originalTablePosition = pingPongTable.position;
        
        if (dynamicLights != null && dynamicLights.Length > 0)
        {
            originalLightIntensities = new float[dynamicLights.Length];
            originalLightColors = new Color[dynamicLights.Length];
            
            for (int i = 0; i < dynamicLights.Length; i++)
            {
                if (dynamicLights[i] != null)
                {
                    originalLightIntensities[i] = dynamicLights[i].intensity;
                    originalLightColors[i] = dynamicLights[i].color;
                }
            }
        }
    }
    
    void StartBackgroundAnimations()
    {
        if (backgroundCamera != null)
            StartCoroutine(AnimateCamera());
        
        if (pingPongTable != null)
            StartCoroutine(AnimateTable());
        
        if (dynamicLights != null && dynamicLights.Length > 0)
            StartCoroutine(AnimateLights());
        
        if (skyboxMaterial != null)
            StartCoroutine(AnimateSkybox());
        
        if (backgroundParticles != null && backgroundParticles.Length > 0)
            StartCoroutine(AnimateParticles());
    }
    
    IEnumerator AnimateCamera()
    {
        while (true)
        {
            // Smooth camera movement
            float offsetX = Mathf.Sin(Time.time * cameraMovementSpeed) * cameraMovementAmplitude;
            float offsetY = Mathf.Cos(Time.time * cameraMovementSpeed * 0.7f) * cameraMovementAmplitude * 0.5f;
            float offsetZ = Mathf.Sin(Time.time * cameraMovementSpeed * 0.3f) * cameraMovementAmplitude * 0.3f;
            
            Vector3 newPosition = originalCameraPosition + new Vector3(offsetX, offsetY, offsetZ);
            backgroundCamera.transform.position = newPosition;
            
            // Optional camera rotation
            if (enableCameraRotation)
            {
                float rotationY = Mathf.Sin(Time.time * cameraRotationSpeed) * 5f;
                backgroundCamera.transform.rotation = Quaternion.Euler(
                    backgroundCamera.transform.rotation.eulerAngles.x,
                    rotationY,
                    backgroundCamera.transform.rotation.eulerAngles.z
                );
            }
            
            yield return null;
        }
    }
    
    IEnumerator AnimateTable()
    {
        while (true)
        {
            // Rotate table
            pingPongTable.Rotate(Vector3.up * tableRotationSpeed * Time.deltaTime);
            
            // Optional floating effect
            if (enableTableFloat)
            {
                float floatOffset = Mathf.Sin(Time.time * tableFloatSpeed) * tableFloatAmplitude;
                Vector3 newPosition = originalTablePosition + Vector3.up * floatOffset;
                pingPongTable.position = newPosition;
            }
            
            yield return null;
        }
    }
    
    IEnumerator AnimateLights()
    {
        while (true)
        {
            for (int i = 0; i < dynamicLights.Length; i++)
            {
                if (dynamicLights[i] != null)
                {
                    // Animate intensity
                    float intensityVariation = Mathf.Sin(Time.time * 2f + i) * lightIntensityVariation;
                    dynamicLights[i].intensity = originalLightIntensities[i] + intensityVariation;
                    
                    // Animate color
                    if (lightColors.Length > 0)
                    {
                        float colorIndex = (Time.time * lightColorChangeSpeed + i) % lightColors.Length;
                        int currentColorIndex = Mathf.FloorToInt(colorIndex);
                        int nextColorIndex = (currentColorIndex + 1) % lightColors.Length;
                        float lerpValue = colorIndex - currentColorIndex;
                        
                        Color targetColor = Color.Lerp(lightColors[currentColorIndex], 
                                                     lightColors[nextColorIndex], lerpValue);
                        dynamicLights[i].color = Color.Lerp(originalLightColors[i], targetColor, 0.5f);
                    }
                }
            }
            yield return null;
        }
    }
    
    IEnumerator AnimateSkybox()
    {
        while (true)
        {
            if (skyboxMaterial.HasProperty("_Rotation"))
            {
                float currentRotation = skyboxMaterial.GetFloat("_Rotation");
                skyboxMaterial.SetFloat("_Rotation", currentRotation + skyboxRotationSpeed * Time.deltaTime);
            }
            yield return null;
        }
    }
    
    IEnumerator AnimateParticles()
    {
        while (true)
        {
            if (enableParticleColorChange)
            {
                foreach (ParticleSystem particles in backgroundParticles)
                {
                    if (particles != null)
                    {
                        var main = particles.main;
                        float hue = (Time.time * 0.1f) % 1f;
                        main.startColor = Color.HSVToRGB(hue, 0.8f, 1f);
                    }
                }
            }
            yield return new WaitForSeconds(0.1f);
        }
    }
    
    public void SetAnimationSpeed(float speedMultiplier)
    {
        cameraMovementSpeed *= speedMultiplier;
        tableRotationSpeed *= speedMultiplier;
        lightColorChangeSpeed *= speedMultiplier;
        skyboxRotationSpeed *= speedMultiplier;
    }
    
    public void EnableAnimation(bool enable)
    {
        if (enable)
        {
            StartBackgroundAnimations();
        }
        else
        {
            StopAllCoroutines();
        }
    }
    
    public void SetLightColors(Color[] newColors)
    {
        lightColors = newColors;
    }
    
    void OnValidate()
    {
        // Clamp values in editor
        cameraMovementAmplitude = Mathf.Clamp(cameraMovementAmplitude, 0f, 2f);
        tableFloatAmplitude = Mathf.Clamp(tableFloatAmplitude, 0f, 1f);
        lightIntensityVariation = Mathf.Clamp(lightIntensityVariation, 0f, 1f);
    }
}