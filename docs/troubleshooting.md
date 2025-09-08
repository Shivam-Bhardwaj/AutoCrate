# Troubleshooting Guide

Common issues and solutions for AutoCrate NX integration.

## Installation and Setup Issues

### Browser Compatibility

**Problem**: AutoCrate not loading properly  
**Solution**:
- Ensure modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Enable JavaScript
- Disable ad blockers for AutoCrate domain
- Clear browser cache and cookies

**Problem**: 3D viewer shows black screen  
**Solution**:
- Update graphics drivers
- Enable hardware acceleration in browser
- Try different browser
- Check WebGL support at webglreport.com

### Network and Loading Issues

**Problem**: Slow loading or timeouts  
**Solution**:
- Check internet connection stability
- Disable VPN if active
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private browsing mode

**Problem**: Assets not loading  
**Solution**:
- Verify access to autocrate.vercel.app
- Check corporate firewall settings
- Whitelist required domains
- Contact IT administrator if needed

## Configuration Issues

### Dimension Input Problems

**Problem**: Cannot enter decimal values  
**Solution**:
- Use period (.) not comma (,) for decimals
- Check keyboard language settings
- Verify numeric input format matches locale

**Problem**: Dimension validation errors  
**Solution**:
```
Minimum dimensions:
- Length: 12 inches
- Width: 12 inches  
- Height: 12 inches
- Weight: 1 lb

Maximum dimensions:
- Length: 240 inches
- Width: 120 inches
- Height: 120 inches  
- Weight: 10,000 lbs
```

### Base Configuration Issues

**Problem**: Skid count not changing  
**Solution**:
- Ensure weight supports selected count
- Check base type compatibility
- Verify spacing allows for skid count
- Heavy loads may require minimum skid count

**Problem**: Invalid skid spacing  
**Solution**:
```
Minimum spacing: 8 inches
Maximum spacing: 36 inches
Must accommodate crate width and skid count
```

### Panel Configuration Issues  

**Problem**: Panel thickness validation fails  
**Solution**:
```
Valid thickness ranges:
- Minimum: 0.25 inches
- Standard: 0.5, 0.75, 1.0 inches
- Maximum: 2.0 inches
Heavy loads may require minimum thickness
```

**Problem**: Ventilation settings not saving  
**Solution**:
- Enable ventilation checkbox first
- Set count before size
- Verify hole size within panel dimensions
- Check for conflicting requirements

## 3D Visualization Issues

### Performance Problems

**Problem**: Slow 3D rendering  
**Solution**:
- Reduce browser tabs
- Close other applications
- Lower display quality in settings
- Disable complex visual effects

**Problem**: 3D view becomes unresponsive  
**Solution**:
- Press F5 to refresh
- Use Ctrl+0 to reset camera
- Check system resources (Task Manager)
- Restart browser if needed

### Display Issues

**Problem**: Missing 3D components  
**Solution**:
- Check component visibility toggles
- Verify configuration is complete
- Use "Reset View" to refresh display
- Regenerate 3D model

**Problem**: Incorrect colors or materials  
**Solution**:
- Check material assignments in configuration
- Verify graphics driver compatibility
- Try different rendering mode (wireframe/solid)
- Reset graphics settings to default

## NX Integration Issues

### Expression Generation Problems

**Problem**: NX expression not generating  
**Solution**:
- Complete all required configuration fields
- Check for validation errors
- Verify weight and dimension compatibility
- Try regenerating expression

**Problem**: Invalid NX syntax errors  
**Solution**:
- Check parameter naming conventions
- Verify numeric format (decimal points)
- Ensure no special characters in names
- Validate coordinate system references

### JT Export Issues

**Problem**: JT export fails  
**Solution**:
- Verify sufficient disk space
- Check file permissions
- Ensure configuration is complete
- Try smaller/simpler configuration first

**Problem**: JT file won't open in NX  
**Solution**:
```
Verify NX version compatibility:
- NX 2022: JT 10.5+
- NX 2023: JT 10.7+
- NX 2024: JT 11.0+
```

### Drawing Generation Issues

**Problem**: Drawing views missing or incomplete  
**Solution**:
- Ensure complete crate configuration
- Check all panels have valid thickness
- Verify base configuration is complete
- Regenerate expression before drawing

**Problem**: Dimensions not showing correctly  
**Solution**:
- Check ASME Y14.5-2009 compliance settings
- Verify dimension precision settings
- Ensure proper units (inches)
- Check decimal place settings

## Performance Issues

### Slow Application Response

**Problem**: Long load times  
**Solution**:
- Clear browser cache
- Disable browser extensions
- Close unnecessary tabs
- Check available system memory

**Problem**: Expression generation timeout  
**Solution**:
```
For complex configurations:
- Increase timeout in settings
- Simplify configuration temporarily
- Generate in stages
- Check system resources
```

### Memory Issues

**Problem**: Browser crashes or freezes  
**Solution**:
- Increase browser memory limit
- Close other applications
- Restart browser
- Check available system RAM

**Problem**: Large file sizes  
**Solution**:
- Optimize 3D quality settings
- Reduce texture resolution
- Compress export files
- Use simplified geometry for complex parts

## Data and Export Issues

### Configuration Save/Load Problems

**Problem**: Cannot save configuration  
**Solution**:
- Check local storage availability
- Clear browser data if storage full
- Verify browser privacy settings
- Use export as backup method

**Problem**: Configuration loads incorrectly  
**Solution**:
- Verify file format and version
- Check for corrupted configuration data
- Try loading in different browser
- Restore from backup if available

### Export Format Issues

**Problem**: Exported files corrupted or unreadable  
**Solution**:
- Check available disk space
- Verify file permissions
- Try different export format
- Contact support with error details

**Problem**: Missing data in exports  
**Solution**:
- Complete all configuration sections
- Verify required fields are filled
- Check for validation warnings
- Regenerate before export

## Applied Materials Standards Issues

### Part Numbering Problems

**Problem**: Invalid part number format  
**Solution**:
```
Correct format: 0205-XXXXX
- Must start with 0205-
- Followed by 5 digits
- No special characters
- Numbers must be valid range
```

**Problem**: TC number generation fails  
**Solution**:
```
Correct format: TC2-XXXXXXX  
- Must start with TC2-
- Followed by 7 digits
- Sequential numbering
- No duplicates allowed
```

### Standards Compliance

**Problem**: ASME Y14.5 validation fails  
**Solution**:
- Check dimension formatting
- Verify tolerance specifications
- Ensure proper geometric tolerancing
- Review drawing layout standards

**Problem**: Material specification errors  
**Solution**:
```
Approved materials only:
- APA plywood grades A-A, A-B, B-B
- Douglas Fir or Southern Pine lumber
- Galvanized steel fasteners
- Industrial-grade vinyl wrap
```

## Browser-Specific Issues

### Chrome Issues

**Problem**: WebGL context lost  
**Solution**:
- Update Chrome to latest version
- Disable hardware acceleration temporarily
- Reset Chrome flags to default
- Check graphics driver updates

### Firefox Issues

**Problem**: 3D performance poor  
**Solution**:
- Enable webgl.force-enabled in about:config
- Update Firefox and graphics drivers
- Disable Firefox privacy features temporarily
- Try Firefox Developer Edition

### Safari Issues

**Problem**: Keyboard shortcuts not working  
**Solution**:
- Use Cmd instead of Ctrl on macOS
- Check Safari preferences for shortcuts
- Disable conflicting Safari extensions
- Update to latest Safari version

## System Requirements Issues

### Minimum Requirements Not Met

**Hardware Requirements**:
```
Minimum:
- 4GB RAM
- DirectX 11 compatible graphics
- 1024x768 display resolution
- Stable internet connection

Recommended:
- 8GB+ RAM  
- Dedicated graphics card
- 1920x1080+ display
- High-speed internet
```

**Software Requirements**:
```
Operating System:
- Windows 10/11
- macOS 10.15+
- Linux Ubuntu 18.04+

Browser Versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
```

## Getting Additional Help

### Self-Service Options

1. **Documentation**: Check complete documentation in /docs
2. **FAQ**: Review frequently asked questions
3. **Examples**: Try working examples and tutorials
4. **Community**: Search user forums and discussions

### Contact Support

**Technical Support**:
- Applied Materials CAD Support Portal
- AutoCrate GitHub Issues
- Internal IT helpdesk

**Bug Reports**:
Include the following information:
- Browser and version
- Operating system
- Configuration details that cause issue
- Console error messages (F12 Developer Tools)
- Steps to reproduce problem

**Feature Requests**:
- Use GitHub Issues with enhancement label
- Provide business case and requirements
- Include mockups or detailed descriptions

---

**Emergency Contact**: For critical production issues, contact Applied Materials CAD support immediately.

**Last Updated**: January 2025